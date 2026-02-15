'use client';

import dynamic from 'next/dynamic';
import type { Components } from 'react-markdown';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-picc-earth mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-picc-earth mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-picc-earth mt-3 mb-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-picc-earth-600 leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-picc-earth">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-picc-ochre hover:text-picc-ochre-600 underline decoration-picc-ochre/30 hover:decoration-picc-ochre transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-5 space-y-1 mb-2 text-picc-earth-600">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-5 space-y-1 mb-2 text-picc-earth-600">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-picc-ochre bg-warm-50 rounded-r-lg px-4 py-3 my-3 text-picc-earth-600 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-warm-100 text-picc-earth px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
  ),
};

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export default function ChatMarkdown({ content, className = '' }: ChatMarkdownProps) {
  return (
    <div className={`chat-markdown text-lg leading-relaxed ${className}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
