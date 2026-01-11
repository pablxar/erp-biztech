import { cn } from "@/lib/utils";
import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Check for inline code first: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        elements.push(
          <code 
            key={keyIndex++} 
            className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-xs"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Check for bold: **text** or __text__
      const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
      if (boldMatch) {
        elements.push(
          <strong key={keyIndex++} className="font-semibold">
            {renderInlineMarkdown(boldMatch[2])}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check for italic: *text* or _text_ (single)
      const italicMatch = remaining.match(/^(\*|_)([^*_]+?)\1/);
      if (italicMatch) {
        elements.push(
          <em key={keyIndex++} className="italic">
            {renderInlineMarkdown(italicMatch[2])}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Check for links: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a 
            key={keyIndex++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Find the next special character
      const nextSpecial = remaining.search(/[`*_\[]/);
      if (nextSpecial === -1) {
        // No more special characters, add the rest as text
        elements.push(<React.Fragment key={keyIndex++}>{remaining}</React.Fragment>);
        break;
      } else if (nextSpecial === 0) {
        // Special character at start but didn't match any pattern, treat as literal
        elements.push(<React.Fragment key={keyIndex++}>{remaining[0]}</React.Fragment>);
        remaining = remaining.slice(1);
      } else {
        // Add text before the special character
        elements.push(<React.Fragment key={keyIndex++}>{remaining.slice(0, nextSpecial)}</React.Fragment>);
        remaining = remaining.slice(nextSpecial);
      }
    }

    return elements.length === 1 ? elements[0] : <>{elements}</>;
  };

  const renderMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';
    let listItems: { content: string; indent: number }[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag 
            key={`list-${elements.length}`} 
            className={cn(
              "my-2 ml-4 space-y-1",
              listType === 'ol' ? "list-decimal" : "list-disc"
            )}
          >
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed" style={{ marginLeft: item.indent * 8 }}>
                {renderInlineMarkdown(item.content)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line) => {
      // Code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushList();
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
          codeBlockContent = '';
        } else {
          elements.push(
            <div key={`code-${elements.length}`} className="my-3">
              {codeBlockLang && (
                <div className="px-3 py-1 bg-muted/80 rounded-t-lg border border-b-0 border-border/50 text-[10px] text-muted-foreground font-mono uppercase">
                  {codeBlockLang}
                </div>
              )}
              <pre className={cn(
                "p-3 bg-muted/50 overflow-x-auto border border-border/50 text-xs font-mono",
                codeBlockLang ? "rounded-b-lg" : "rounded-lg"
              )}>
                <code>{codeBlockContent}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeBlockLang = '';
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent += (codeBlockContent ? '\n' : '') + line;
        return;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        flushList();
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const headerClasses: Record<number, string> = {
          1: "text-xl font-bold mt-4 mb-2",
          2: "text-lg font-bold mt-3 mb-2",
          3: "text-base font-semibold mt-3 mb-1",
          4: "text-sm font-semibold mt-2 mb-1",
          5: "text-sm font-medium mt-2 mb-1",
          6: "text-xs font-medium mt-2 mb-1",
        };
        elements.push(
          React.createElement(
            `h${level}` as keyof JSX.IntrinsicElements,
            { 
              key: `h-${elements.length}`, 
              className: headerClasses[level] 
            },
            renderInlineMarkdown(text)
          )
        );
        return;
      }

      // Unordered list items
      const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        const indent = Math.floor(ulMatch[1].length / 2);
        listItems.push({ content: ulMatch[2], indent });
        return;
      }

      // Ordered list items
      const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        const indent = Math.floor(olMatch[1].length / 2);
        listItems.push({ content: olMatch[2], indent });
        return;
      }

      // Horizontal rule
      if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
        flushList();
        elements.push(<hr key={`hr-${elements.length}`} className="my-3 border-border/50" />);
        return;
      }

      // Blockquote
      const quoteMatch = line.match(/^>\s*(.*)$/);
      if (quoteMatch) {
        flushList();
        elements.push(
          <blockquote 
            key={`quote-${elements.length}`} 
            className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic"
          >
            {renderInlineMarkdown(quoteMatch[1])}
          </blockquote>
        );
        return;
      }

      // Empty line
      if (line.trim() === '') {
        flushList();
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="text-sm leading-relaxed my-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      {renderMarkdown(content)}
    </div>
  );
}
