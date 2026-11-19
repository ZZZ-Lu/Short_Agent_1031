import React, { useMemo } from 'react';
import {
  parseMarkdownBlocks,
  type MarkdownInlineNode,
} from '../utils/markdownBlocks';

interface MarkdownContentProps {
  content: string;
  compact?: boolean;
  className?: string;
}

function renderInlines(nodes: MarkdownInlineNode[], keyPrefix: string) {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}_${idx}`;
    if (node.type === 'bold') {
      return (
        <strong key={key} className="font-semibold text-neutral-900 dark:text-neutral-100">
          {node.text}
        </strong>
      );
    }
    if (node.type === 'italic') {
      return (
        <em key={key} className="italic text-neutral-700 dark:text-neutral-300">
          {node.text}
        </em>
      );
    }
    if (node.type === 'code') {
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[0.9em] font-mono text-blue-700 dark:text-blue-300 border border-neutral-200/70 dark:border-neutral-700/70"
        >
          {node.text}
        </code>
      );
    }
    return <React.Fragment key={key}>{node.text}</React.Fragment>;
  });
}

export const MarkdownContent: React.FC<MarkdownContentProps> = React.memo(function MarkdownContent({
  content,
  compact = false,
  className = '',
}) {
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div
      className={`text-neutral-700 dark:text-neutral-200 ${
        compact ? 'text-[13px] leading-[1.65] space-y-2.5' : 'text-[14px] leading-[1.75] space-y-3.5'
      } ${className}`}
    >
      {blocks.map((block, index) => {
        const key = `md_block_${index}`;
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <h1
                  key={key}
                  className={`${
                    compact ? 'text-[15px]' : 'text-[17px]'
                  } font-bold tracking-tight text-neutral-900 dark:text-neutral-50 pt-1 first:pt-0`}
                >
                  {renderInlines(block.inlines, key)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2
                  key={key}
                  className={`${
                    compact ? 'text-[14px]' : 'text-[15.5px]'
                  } font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 pt-1.5 first:pt-0 flex items-center gap-1.5`}
                >
                  <span className="inline-block w-1 h-3.5 rounded-full bg-blue-500/85 dark:bg-blue-400/85 shrink-0" />
                  <span>{renderInlines(block.inlines, key)}</span>
                </h2>
              );
            }
            return (
              <h3
                key={key}
                className={`${
                  compact ? 'text-[13px]' : 'text-[14px]'
                } font-semibold text-neutral-800 dark:text-neutral-100 pt-1 first:pt-0`}
              >
                {renderInlines(block.inlines, key)}
              </h3>
            );
          }

          case 'paragraph':
            return (
              <p key={key} className="whitespace-pre-wrap break-words">
                {renderInlines(block.inlines, key)}
              </p>
            );

          case 'list': {
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag
                key={key}
                className={`${
                  block.ordered ? 'list-decimal' : 'list-disc'
                } pl-4.5 space-y-1.5 marker:text-neutral-400 dark:marker:text-neutral-500`}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={`${key}_li_${itemIdx}`} className="break-words pl-0.5">
                    {renderInlines(item, `${key}_li_${itemIdx}`)}
                  </li>
                ))}
              </ListTag>
            );
          }

          case 'table':
            return (
              <div
                key={key}
                className="w-full overflow-x-auto rounded-xl border border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-neutral-900/50"
              >
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-neutral-200/90 dark:border-neutral-700/80 bg-neutral-100/80 dark:bg-neutral-800/80">
                      {block.headers.map((header, hIdx) => (
                        <th
                          key={`${key}_th_${hIdx}`}
                          className={`${
                            compact ? 'px-2.5 py-1.5 text-[11.5px]' : 'px-3 py-2 text-[12.5px]'
                          } font-semibold text-neutral-800 dark:text-neutral-100 whitespace-nowrap`}
                        >
                          {renderInlines(header, `${key}_th_${hIdx}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={`${key}_tr_${rIdx}`}
                        className="hover:bg-white/70 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={`${key}_td_${rIdx}_${cIdx}`}
                            className={`${
                              compact ? 'px-2.5 py-1.5 text-[12px]' : 'px-3 py-2 text-[13px]'
                            } align-top text-neutral-700 dark:text-neutral-200 leading-snug ${
                              cIdx === 0 ? 'whitespace-nowrap' : 'min-w-[110px]'
                            }`}
                          >
                            {renderInlines(cell, `${key}_td_${rIdx}_${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'blockquote':
            return (
              <blockquote
                key={key}
                className="border-l-2 border-blue-400/80 dark:border-blue-500/70 pl-3 py-0.5 text-neutral-600 dark:text-neutral-300 bg-blue-50/40 dark:bg-blue-950/20 rounded-r-lg"
              >
                {renderInlines(block.inlines, key)}
              </blockquote>
            );

          case 'code':
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 px-3 py-2.5 text-[12px] leading-relaxed font-mono text-neutral-800 dark:text-neutral-200"
              >
                <code>{block.content}</code>
              </pre>
            );

          case 'hr':
            return (
              <hr
                key={key}
                className="border-t border-neutral-200/80 dark:border-neutral-700/70 my-2"
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
});
