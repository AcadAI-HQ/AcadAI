import { getAllPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';
import { PenLine } from 'lucide-react';

export const metadata = {
  title: 'Blog — Acad AI',
  description:
    'Career advice, learning strategies, and technical guides for developers breaking into tech.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-500 font-mono mb-6">
          <PenLine className="h-3.5 w-3.5" />
          From the Acad AI team
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111827] leading-tight">
          Career guides for <br className="hidden sm:block" />
          <span className="text-[#29ABE2]">developers who ship.</span>
        </h1>
        <p className="mt-5 text-lg text-gray-500 max-w-xl">
          No fluff. Practical advice on learning, job hunting, and building a
          career in tech — from people who've been through it.
        </p>
      </div>

      {/* Posts grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-2xl bg-[#EEF4FF] border border-[#29ABE2]/20 p-10 text-center">
        <h2 className="text-2xl font-bold text-[#111827] mb-3">
          Ready to stop guessing what to learn?
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Acad AI builds you a personalized roadmap based on your skills and
          the tech skills companies are actually hiring for right now.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[#111827] text-white px-6 py-3 font-semibold hover:bg-[#1f2937] transition-colors"
        >
          Build my roadmap
        </a>
      </div>
    </main>
  );
}
