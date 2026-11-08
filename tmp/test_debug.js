const fs = require('fs');
const trace = fs.readFileSync('public/assets/aistudio/trace__________39turns_1ae42e10.md', 'utf8');
const turn22Match = trace.match(/### \[第 22 轮\] 模型原始输出[\s\S]*?```text\n([\s\S]*?)\n```/);
const text = turn22Match[1];
const startIdx = text.indexOf('{{');
let cursor = startIdx + 2;
let curlyDepth = 0;
let inString = false;
let stringQuote = '';
let escaped = false;
let blockEnd = -1;

while (cursor < text.length) {
  const char = text[cursor];
  if (escaped) { escaped = false; cursor++; continue; }
  if (char === '\\' && inString) { escaped = true; cursor++; continue; }
  if (inString) {
    if (char === stringQuote) inString = false;
    cursor++;
    continue;
  }
  if (char === '"' || char === "'") {
    inString = true;
    stringQuote = char;
    cursor++;
    continue;
  }
  if (char === '{') { curlyDepth++; cursor++; continue; }
  if (char === '}') {
    if (curlyDepth > 0) {
      curlyDepth--;
      cursor++;
      continue;
    } else if (text.startsWith('}}', cursor)) {
      blockEnd = cursor + 2;
      break;
    }
  }
  cursor++;
}
console.log('blockEnd:', blockEnd);
console.log('curlyDepth at end:', curlyDepth);
console.log('text length:', text.length);
if (blockEnd === -1) {
  const fallback = text.slice(startIdx).match(/^\{\{([\s\S]*?)\}\}/);
  console.log('fallback match:', fallback ? fallback[1].slice(0, 100) : null);
}
