import type { BlogPost } from '@/types/blog';
import post1 from '@/content/blog/breaking-into-frontend-dev-2025';
import post2 from '@/content/blog/system-design-fundamentals';
import post3 from '@/content/blog/why-junior-dev-applications-get-rejected';
import post4 from '@/content/blog/ai-tools-every-developer-should-know-2026';

const allPosts: BlogPost[] = [post1, post2, post3, post4];

export function getAllPosts(): BlogPost[] {
  return [...allPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
