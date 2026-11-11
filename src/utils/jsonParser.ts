/**
 * 健壮的 JSON 解析与自愈引擎
 * 针对 LLM 生成的长文本、嵌套结构、截断或少闭合大括号进行状态栈自愈
 */

export function autoCloseJsonString(input: string): string {
  let s = input.trim();
  let inString = false;
  let stringChar = '';
  let escaped = false;
  const stack: string[] = [];
  let out = '';

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (escaped) {
      escaped = false;
      out += char;
      continue;
    }
    if (char === '\\' && inString) {
      escaped = true;
      out += char;
      continue;
    }
    if (inString) {
      if (char === stringChar) {
        inString = false;
        out += char;
        continue;
      }
      if (char === '\n') {
        out += '\\n';
        continue;
      }
      if (char === '\r') {
        out += '\\r';
        continue;
      }
      if (char === '\t') {
        out += '\\t';
        continue;
      }
      out += char;
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }
    if (char === '{') {
      stack.push('}');
      out += char;
      continue;
    }
    if (char === '[') {
      stack.push(']');
      out += char;
      continue;
    }
    if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '}') {
        stack.pop();
      }
      out += char;
      continue;
    }
    if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ']') {
        stack.pop();
      }
      out += char;
      continue;
    }
    out += char;
  }

  let repaired = out;
  if (inString) {
    repaired += (stringChar || '"');
  }
  repaired = repaired.replace(/,\s*$/, '');
  while (stack.length > 0) {
    repaired += stack.pop();
  }
  return repaired;
}

export function stripIncompleteJsonTail(input: string): string {
  let s = input.trim();
  if (!s) return s;

  for (let i = 0; i < 5; i++) {
    const prev = s;
    s = s.replace(/,\s*"[^"]*"?\s*:?\s*$/, '');
    s = s.replace(/([{,\[])\s*"[^"]*"?\s*:?\s*$/, '$1');
    s = s.replace(/:\s*$/, '');
    s = s.replace(/,\s*$/, '');
    if (s.trim() === prev.trim()) break;
  }

  if (!s.trim()) {
    if (input.trim().startsWith('{')) return '{';
    if (input.trim().startsWith('[')) return '[';
  }
  return s;
}

export function robustParseJson<T = any>(str: string): T | null {
  if (!str || typeof str !== 'string') return null;

  let cleaned = str.trim();
  // 1. Strip Markdown code block if wrapped in ```json ... ```
  const mdMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (mdMatch) {
    cleaned = mdMatch[1].trim();
  }

  // 1. Direct try
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 2. State-stack auto-close try (fixes unclosed braces, quotes, brackets without truncation)
  try {
    const closed = autoCloseJsonString(cleaned);
    return JSON.parse(closed);
  } catch {}

  // 3. Auto-close with incomplete tail stripped (e.g. truncated after key or colon)
  try {
    const stripped = stripIncompleteJsonTail(cleaned);
    const closedStripped = autoCloseJsonString(stripped);
    return JSON.parse(closedStripped);
  } catch {}

  // 4. Repair common LLM JSON formatting defects:
  let repaired = cleaned
    .replace(/(["\d\]}])\s*\n\s*(["\d\[{])/g, '$1,\n$2')
    .replace(/(")\s+(")/g, '$1, $2')
    .replace(/(\})\s+(\{)/g, '$1, $2')
    .replace(/(\])\s+(\[)/g, '$1, $2')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/([{,]\s*)'([^'\\]*(?:\\.[^'\\]*)*)'\s*:/g, '$1"$2":')
    .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ':"$1"')
    .replace(/([\[,]\s*)'([^'\\]*(?:\\.[^'\\]*)*)'/g, '$1"$2"');

  try {
    return JSON.parse(repaired);
  } catch {}

  try {
    const closedRepaired = autoCloseJsonString(repaired);
    return JSON.parse(closedRepaired);
  } catch {}

  try {
    const strippedRepaired = stripIncompleteJsonTail(repaired);
    const closedStrippedRepaired = autoCloseJsonString(strippedRepaired);
    return JSON.parse(closedStrippedRepaired);
  } catch {}

  // 5. Boundary recovery only if string starts with leading garbage before { or [
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  if (startIdx > 0) {
    const leadingCleaned = cleaned.slice(startIdx);
    try {
      return JSON.parse(leadingCleaned);
    } catch {}
    try {
      return JSON.parse(autoCloseJsonString(leadingCleaned));
    } catch {}
    try {
      const strippedLeading = stripIncompleteJsonTail(leadingCleaned);
      return JSON.parse(autoCloseJsonString(strippedLeading));
    } catch {}
  }

  // 6. Fallback manual repair suffixes
  const autoRepairSuffixes = ['}', ']', '}]', '}]}', '"}]}', '"]}', '"}', '"'];
  for (const s of autoRepairSuffixes) {
    try {
      return JSON.parse(cleaned + s);
    } catch {}
    try {
      return JSON.parse(repaired + s);
    } catch {}
  }

  return null;
}

/**
 * When a model outputs `{{调用 toolName, {"a": [{"b": 1}]}}` (writing 2 closing braces `}}` instead of 3 `}}}`
 * by visually merging the outer JSON `}` with the `{{...}}` command terminator `}}`), stripping the trailing `}}`
 * leaves `rawArgs` missing only its final outer `}`.
 * This helper deterministically checks if appending that single shared `}` yields a 100% valid JSON object.
 */
export function tryHealSharedClosingBraceInToolArgs(rawArgs: string): string | null {
  if (!rawArgs || typeof rawArgs !== 'string') return null;
  const trimmed = rawArgs.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const alreadyValid = JSON.parse(trimmed);
    if (alreadyValid && typeof alreadyValid === 'object' && !Array.isArray(alreadyValid)) {
      return trimmed;
    }
  } catch {}

  const candidate = `${trimmed}}`;
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return candidate;
    }
  } catch {}

  return null;
}


