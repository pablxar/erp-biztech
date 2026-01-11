import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const renderMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';
    let listItems: string[] = [];
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
              <li key={i} className="text-sm leading-relaxed">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const renderInlineMarkdown = (text: string): React.ReactNode => {
      // Handle inline code
      let result: React.ReactNode[] = [];
      const parts = text.split(/(`[^`]+`)/g);
      
      parts.forEach((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          result.push(
            <code 
              key={idx} 
              className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-xs"
            >
              {part.slice(1, -1)}
            </code>
          );
        } else {
          // Handle bold and italic
          let processed = part;
          
          // Bold: **text** or __text__
          processed = processed.replace(/\*\*([^*]+)\*\*/g, '%%BOLD_START%%$1%%BOLD_END%%');
          processed = processed.replace(/__([^_]+)__/g, '%%BOLD_START%%$1%%BOLD_END%%');
          
          // Italic: *text* or _text_
          processed = processed.replace(/\*([^*]+)\*/g, '%%ITALIC_START%%$1%%ITALIC_END%%');
          processed = processed.replace(/_([^_]+)_/g, '%%ITALIC_START%%$1%%ITALIC_END%%');
          
          // Links: [text](url)
          processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '%%LINK_START%%$1%%LINK_DIVIDER%%$2%%LINK_END%%');
          
          const segments = processed.split(/(%%[A-Z_]+%%)/g);
          let isBold = false;
          let isItalic = false;
          let linkText = '';
          let inLink = false;
          
          segments.forEach((segment, segIdx) => {
            if (segment === '%%BOLD_START%%') {
              isBold = true;
            } else if (segment === '%%BOLD_END%%') {
              isBold = false;
            } else if (segment === '%%ITALIC_START%%') {
              isItalic = true;
            } else if (segment === '%%ITALIC_END%%') {
              isItalic = false;
            } else if (segment === '%%LINK_START%%') {
              inLink = true;
              linkText = '';
            } else if (segment === '%%LINK_DIVIDER%%') {
              // Next segment will be URL
            } else if (segment === '%%LINK_END%%') {
              inLink = false;
            } else if (segment && !segment.startsWith('%%')) {
              if (inLink && !linkText) {
                linkText = segment;
              } else if (inLink && linkText) {
                // This is the URL
                result.push(
                  <a 
                    key={`${idx}-${segIdx}`}
                    href={segment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {linkText}
                  </a>
                );
              } else {
                let styledSegment: React.ReactNode = segment;
                
                if (isBold && isItalic) {
                  styledSegment = <strong key={`${idx}-${segIdx}`}><em>{segment}</em></strong>;
                } else if (isBold) {
                  styledSegment = <strong key={`${idx}-${segIdx}`} className="font-semibold">{segment}</strong>;
                } else if (isItalic) {
                  styledSegment = <em key={`${idx}-${segIdx}`}>{segment}</em>;
                }
                
                result.push(styledSegment);
              }
            }
          });
        }
      });
      
      return result.length === 1 ? result[0] : <>{result}</>;
    };

    lines.forEach((line, index) => {
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
        const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
        const headerClasses = {
          1: "text-xl font-bold mt-4 mb-2",
          2: "text-lg font-bold mt-3 mb-2",
          3: "text-base font-semibold mt-3 mb-1",
          4: "text-sm font-semibold mt-2 mb-1",
          5: "text-sm font-medium mt-2 mb-1",
          6: "text-xs font-medium mt-2 mb-1",
        };
        elements.push(
          <HeaderTag 
            key={`h-${elements.length}`} 
            className={headerClasses[level as keyof typeof headerClasses]}
          >
            {renderInlineMarkdown(text)}
          </HeaderTag>
        );
        return;
      }

      // Unordered list items
      const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        return;
      }

      // Ordered list items
      const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
      if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(olMatch[1]);
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
