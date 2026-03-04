"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Components } from 'react-markdown';

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold tracking-tight text-[#111827] font-headline">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-[#111827] border-b border-gray-100 pb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-[#111827]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 leading-relaxed text-gray-700 text-[1.0625rem]">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 space-y-1.5 pl-6 list-disc marker:text-gray-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 space-y-1.5 pl-6 list-decimal marker:text-gray-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-700 leading-relaxed text-[1.0625rem]">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#111827]">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-[#29ABE2] pl-5 italic text-gray-600 bg-blue-50/50 py-3 pr-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#29ABE2] underline underline-offset-2 hover:text-[#2196ce] transition-colors"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-10 border-gray-200" />,
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isBlock = Boolean(match);

    if (isBlock) {
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          {match?.[1] && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
              {match[1]}
            </div>
          )}
          <SyntaxHighlighter
            style={oneLight as Record<string, React.CSSProperties>}
            language={match?.[1] || 'text'}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.875rem',
              lineHeight: '1.6',
              background: '#fafafa',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[#111827] font-mono text-sm border border-gray-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  img: ({ src, alt }) => (
    <figure className="my-8">
      <img
        src={src || ''}
        alt={alt || ''}
        className="w-full rounded-xl border border-gray-100 shadow-sm object-cover"
      />
      {alt && (
        <figcaption className="mt-3 text-center text-sm text-gray-400 italic">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
};

export function BlogContent({ content }: { content: string }) {
  return (
    <article className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
