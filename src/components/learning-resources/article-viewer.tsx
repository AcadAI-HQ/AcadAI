'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import { ResourceItem } from '@/types/weekly-resources';

// Dynamically import syntax highlighter to avoid SSR issues
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false }
);

// Import styles separately
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ArticleViewerProps {
  resource: ResourceItem;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleViewer({ resource, isOpen, onClose }: ArticleViewerProps) {
  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  if (!resource.content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                {resource.title}
              </DialogTitle>
              <p className="text-sm text-gray-400">{resource.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Badge variant="outline" className={difficultyColors[resource.difficulty]}>
              {resource.difficulty}
            </Badge>
            <Badge variant="outline" className="border-gray-700 capitalize">
              {resource.type}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{resource.estimatedTime} min read</span>
            </div>
            {resource.url && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => window.open(resource.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Article Content */}
        <ScrollArea className="flex-1 p-6">
          <article className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-4 mt-8 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mb-3 mt-6">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-white mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="ml-4">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#29ABE2] pl-4 italic text-gray-400 my-4">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#29ABE2] hover:underline"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">{children}</strong>
                ),
              }}
            >
              {resource.content.markdown}
            </ReactMarkdown>
          </article>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
