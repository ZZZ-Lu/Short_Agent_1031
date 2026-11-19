export type MarkdownInlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'code'; text: string };

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; inlines: MarkdownInlineNode[] }
  | { type: 'paragraph'; inlines: MarkdownInlineNode[] }
  | { type: 'list'; ordered: boolean; items: MarkdownInlineNode[][] }
  | { type: 'table'; headers: MarkdownInlineNode[][]; rows: MarkdownInlineNode[][][] }
  | { type: 'blockquote'; inlines: MarkdownInlineNode[] }
  | { type: 'code'; language: string; content: string }
  | { type: 'hr' };

export function parseMarkdownInlines(text: string): MarkdownInlineNode[] {
  if (!text) return [];
  const nodes: MarkdownInlineNode[] = [];
  const tokenRegex = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push({ type: 'code', text: token.slice(1, -1) });
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      nodes.push({ type: 'bold', text: token.slice(2, -2) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push({ type: 'italic', text: token.slice(1, -1) });
    } else {
      nodes.push({ type: 'text', text: token });
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) });
  }
  return nodes;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map(cell => cell.trim());
}

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
  const cells = splitTableRow(trimmed);
  if (cells.length === 0) return false;
  return cells.every(cell => /^:?-{2,}:?$/.test(cell));
}

function isTableCandidateLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && splitTableRow(trimmed).length >= 2;
}

export function stripMarkdownFormatting(text: string): string {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.、]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseMarkdownBlocks(raw: string): MarkdownBlock[] {
  if (!raw || typeof raw !== 'string') return [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) i++;
      blocks.push({ type: 'code', language, content: codeLines.join('\n') });
      continue;
    }

    // Horizontal rule
    if (/^(?:---+|___+|\*\*\*+)$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // ATX Headings (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(3, headingMatch[1].length) as 1 | 2 | 3;
      blocks.push({ type: 'heading', level, inlines: parseMarkdownInlines(headingMatch[2].trim()) });
      i++;
      continue;
    }

    // Standalone Chinese section heading like **一、讲了什么（剧情主线）**
    const boldSectionMatch = trimmed.match(/^\*\*([一二三四五六七八九十\d]+[、.．][^*]+)\*\*$/);
    if (boldSectionMatch) {
      blocks.push({ type: 'heading', level: 2, inlines: [{ type: 'text', text: boldSectionMatch[1].trim() }] });
      i++;
      continue;
    }

    // GFM Table
    if (
      i + 1 < lines.length &&
      isTableCandidateLine(line) &&
      isTableSeparatorLine(lines[i + 1])
    ) {
      const headerCells = splitTableRow(line);
      const headers = headerCells.map(cell => parseMarkdownInlines(cell));
      const rows: MarkdownInlineNode[][][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        const rowCells = splitTableRow(lines[i]);
        const normalizedRow = headerCells.map((_, colIdx) =>
          parseMarkdownInlines(rowCells[colIdx] ?? '')
        );
        rows.push(normalizedRow);
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', inlines: parseMarkdownInlines(quoteLines.join(' ')) });
      continue;
    }

    // Unordered list
    if (/^[-*+•]\s+/.test(trimmed)) {
      const items: MarkdownInlineNode[][] = [];
      while (i < lines.length && /^\s*[-*+•]\s+/.test(lines[i])) {
        const itemText = lines[i].trim().replace(/^[-*+•]\s+/, '');
        items.push(parseMarkdownInlines(itemText));
        i++;
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\d+[.、]\s+/.test(trimmed)) {
      const items: MarkdownInlineNode[][] = [];
      while (i < lines.length && /^\s*\d+[.、]\s+/.test(lines[i])) {
        const itemText = lines[i].trim().replace(/^\d+[.、]\s+/, '');
        items.push(parseMarkdownInlines(itemText));
        i++;
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Paragraph (consume consecutive plain lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      const curTrimmed = cur.trim();
      if (
        !curTrimmed ||
        curTrimmed.startsWith('```') ||
        /^(?:---+|___+|\*\*\*+)$/.test(curTrimmed) ||
        /^#{1,3}\s+/.test(curTrimmed) ||
        /^\*\*([一二三四五六七八九十\d]+[、.．][^*]+)\*\*$/.test(curTrimmed) ||
        curTrimmed.startsWith('>') ||
        /^[-*+•]\s+/.test(curTrimmed) ||
        /^\d+[.、]\s+/.test(curTrimmed) ||
        (i + 1 < lines.length && isTableCandidateLine(cur) && isTableSeparatorLine(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(curTrimmed);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', inlines: parseMarkdownInlines(paraLines.join('\n')) });
    }
  }

  return blocks;
}
