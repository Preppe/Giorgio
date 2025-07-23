import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-primary mb-4 border-b border-primary/30 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-primary mb-3 border-b border-primary/20 pb-1">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-primary mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-primary mb-2">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold text-primary mb-1">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-xs font-semibold text-primary mb-1">
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="text-foreground mb-3 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 ml-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 ml-4 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-foreground leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic text-foreground/80 mb-3 bg-primary/5 py-2">
        {children}
      </blockquote>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <code className="bg-accent/20 text-accent px-1.5 py-0.5 rounded text-sm font-mono border border-accent/30">
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-card border border-border rounded-lg p-4 mb-3 text-sm font-mono overflow-x-auto text-foreground">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-card border border-border rounded-lg p-4 mb-3 text-sm font-mono overflow-x-auto">
        {children}
      </pre>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-primary hover:text-accent underline underline-offset-2 decoration-primary/50 hover:decoration-accent transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-primary">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground/90">
        {children}
      </em>
    ),
    hr: () => (
      <hr className="my-6 border-border" />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-primary/10">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-primary/5 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold text-primary border-r border-border last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-foreground border-r border-border last:border-r-0">
        {children}
      </td>
    ),
  };

  return (
    <div className={`markdown-content leading-relaxed ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}