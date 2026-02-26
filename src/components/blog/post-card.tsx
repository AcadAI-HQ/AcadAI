import Link from 'next/link';
import type { BlogPost } from '@/types/blog';
import { formatDate } from '@/lib/blog';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#EEF4FF] text-[#29ABE2] border border-[#29ABE2]/20"
          >
            {tag}
          </span>
        ))}
      </div>

      <h2 className="text-xl font-bold text-[#111827] leading-snug mb-3 group-hover:text-[#29ABE2] transition-colors duration-200">
        {post.title}
      </h2>

      <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        <span className="flex items-center gap-1 text-xs font-semibold text-[#29ABE2] group-hover:gap-2 transition-all duration-200">
          Read more
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
