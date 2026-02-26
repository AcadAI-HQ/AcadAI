import type { ReactNode } from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export const metadata = {
  title: 'Blog — Acad AI',
  description:
    'Career advice, learning strategies, and technical guides for developers breaking into tech.',
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="force-light min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrainCircuit className="h-6 w-6 text-[#29ABE2]" />
            <span className="font-headline text-xl font-semibold text-[#111827]">
              Acad AI
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/blog"
              className="text-sm font-medium text-[#111827] hover:text-[#29ABE2] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-gray-100 mt-20">
        <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2026 Acad AI. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[#111827] transition-colors">
              Home
            </Link>
            <Link href="/blog" className="hover:text-[#111827] transition-colors">
              Blog
            </Link>
            <Link href="/signup" className="hover:text-[#111827] transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
