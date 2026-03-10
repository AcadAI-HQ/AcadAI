/**
 * blog-server.ts — SERVER ONLY. Do not import in client components.
 *
 * Merges static blog posts (src/content/blog/) with AI-generated posts
 * stored in Firestore `blog-posts` collection.
 *
 * Dynamic posts appear first; static posts fill the rest.
 * Deduplication by slug ensures a static post can be "upgraded" by storing
 * a dynamic version with the same slug in Firestore.
 */

import { adminDb } from '@/lib/firebase-admin';
import {
  getAllPosts as getStaticPosts,
  getPostBySlug as getStaticPostBySlug,
} from '@/lib/blog';
import type { BlogPost } from '@/types/blog';

const COLLECTION = 'blog-posts';

async function fetchDynamicPosts(): Promise<BlogPost[]> {
  if (!adminDb) return [];

  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .orderBy('date', 'desc')
      .limit(50)
      .get();

    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        slug: d.slug as string,
        title: d.title as string,
        date: d.date as string,
        excerpt: d.excerpt as string,
        readTime: d.readTime as string,
        tags: (d.tags as string[]) ?? [],
        content: d.content as string,
        coverImage: d.coverImage as string | undefined,
      } satisfies BlogPost;
    });
  } catch (err) {
    console.error('[blog-server] Failed to fetch dynamic posts from Firestore:', err);
    return [];
  }
}

/**
 * Returns all blog posts — static + AI-generated — sorted newest first.
 * AI-generated posts take precedence if slugs collide.
 */
export async function getAllPostsIncludingDynamic(): Promise<BlogPost[]> {
  const [staticPosts, dynamicPosts] = await Promise.all([
    Promise.resolve(getStaticPosts()),
    fetchDynamicPosts(),
  ]);

  const seen = new Set<string>();
  const merged: BlogPost[] = [];

  // Dynamic posts win on slug collision
  for (const post of dynamicPosts) {
    seen.add(post.slug);
    merged.push(post);
  }
  for (const post of staticPosts) {
    if (!seen.has(post.slug)) {
      merged.push(post);
    }
  }

  return merged.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Looks up a post by slug — checks static first (fast, no network),
 * then falls back to Firestore for AI-generated posts.
 */
export async function getPostBySlugIncludingDynamic(
  slug: string
): Promise<BlogPost | undefined> {
  // Fast path: static posts
  const staticPost = getStaticPostBySlug(slug);
  if (staticPost) return staticPost;

  if (!adminDb) return undefined;

  try {
    const doc = await adminDb.collection(COLLECTION).doc(slug).get();
    if (!doc.exists) return undefined;

    const d = doc.data()!;
    return {
      slug: d.slug as string,
      title: d.title as string,
      date: d.date as string,
      excerpt: d.excerpt as string,
      readTime: d.readTime as string,
      tags: (d.tags as string[]) ?? [],
      content: d.content as string,
      coverImage: d.coverImage as string | undefined,
    } satisfies BlogPost;
  } catch (err) {
    console.error(`[blog-server] Failed to fetch post slug="${slug}":`, err);
    return undefined;
  }
}
