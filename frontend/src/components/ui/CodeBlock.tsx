import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'sql' }: CodeBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 text-sm font-mono">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
