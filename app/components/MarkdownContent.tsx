'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Style links
          a: ({ ...props }) => (
            <a
              {...props}
              className="text-primary hover:text-primary/80 underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          // Style headings
          h1: ({ ...props }) => (
            <h1 {...props} className="text-2xl font-bold text-foreground mt-6 mb-4" />
          ),
          h2: ({ ...props }) => (
            <h2 {...props} className="text-xl font-bold text-foreground mt-5 mb-3" />
          ),
          h3: ({ ...props }) => (
            <h3 {...props} className="text-lg font-bold text-foreground mt-4 mb-2" />
          ),
          // Style paragraphs
          p: ({ ...props }) => (
            <p {...props} className="text-foreground/90 my-3 leading-relaxed" />
          ),
          // Style lists
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc list-inside my-3 text-foreground/90" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal list-inside my-3 text-foreground/90" />
          ),
          // Style code blocks
          code: ({ inline, ...props }: CodeProps) => (
            inline ? (
              <code {...props} className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm" />
            ) : (
              <code {...props} className="block bg-gray-100 dark:bg-gray-800 rounded p-3 my-3 text-sm overflow-x-auto" />
            )
          ),
          // Style blockquotes
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary pl-4 my-4 italic text-foreground/80"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 