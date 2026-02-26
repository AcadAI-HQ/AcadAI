import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug, formatDate } from '@/lib/blog';
import { BlogContent } from '@/components/blog/blog-content';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Acad AI Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#111827] transition-colors mb-10 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to blog
      </Link>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#EEF4FF] text-[#29ABE2] border border-[#29ABE2]/20"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827] leading-tight mb-6">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-5 text-sm text-gray-400 pb-8 border-b border-gray-100 mb-10">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(post.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {post.readTime}
        </span>
      </div>

      {/* Content */}
      <BlogContent content={post.content} />

      {/* Bottom CTA */}
      <div className="mt-16 rounded-2xl bg-[#EEF4FF] border border-[#29ABE2]/20 p-8 text-center">
        <h2 className="text-xl font-bold text-[#111827] mb-2">
          Build your personalized learning roadmap
        </h2>
        <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
          Acad AI shows you exactly what to learn based on your current skills
          and what companies are hiring for right now.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[#111827] text-white px-5 py-2.5 font-semibold text-sm hover:bg-[#1f2937] transition-colors"
        >
          Get started — it's free
        </Link>
      </div>

      {/* Back link bottom */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#111827] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          More posts
        </Link>
      </div>
    </main>
  );
}
