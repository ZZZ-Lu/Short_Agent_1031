import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownBlocks, parseMarkdownInlines, stripMarkdownFormatting } from './markdownBlocks';

test('parseMarkdownInlines parses bold, italic, code, and plain spans accurately', () => {
  const nodes = parseMarkdownInlines('主角 **Juno** 埋下 `暗雷` 并表现出 *温柔* 假象');
  assert.deepEqual(nodes, [
    { type: 'text', text: '主角 ' },
    { type: 'bold', text: 'Juno' },
    { type: 'text', text: ' 埋下 ' },
    { type: 'code', text: '暗雷' },
    { type: 'text', text: ' 并表现出 ' },
    { type: 'italic', text: '温柔' },
    { type: 'text', text: ' 假象' },
  ]);
});

test('parseMarkdownBlocks parses Chinese section headers, lists, and GFM tables', () => {
  const sample = [
    '**一、讲了什么（剧情主线）**',
    '',
    '《一首歌的价格》是一档音乐综艺。',
    '',
    '- **第1集**：建置人物与规则。',
    '- **第2集**：全屋猜雷。',
    '',
    '| 主角 | 类型 | 核心特质 |',
    '|---|---|---|',
    '| **Juno** | 心机谋略型 | 表面温柔实则算计 |',
    '| **Avery** | 天赋逆袭型 | 唱功最强却自卑 |',
  ].join('\n');

  const blocks = parseMarkdownBlocks(sample);
  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'list');
  if (blocks[2].type === 'list') {
    assert.equal(blocks[2].ordered, false);
    assert.equal(blocks[2].items.length, 2);
  }
  assert.equal(blocks[3].type, 'table');
  if (blocks[3].type === 'table') {
    assert.equal(blocks[3].headers.length, 3);
    assert.equal(blocks[3].rows.length, 2);
    assert.deepEqual(blocks[3].rows[0][0], [{ type: 'bold', text: 'Juno' }]);
  }
});

test('stripMarkdownFormatting cleans headings, markers, and tables to plain preview text', () => {
  const plain = stripMarkdownFormatting('## **角色表**\n- **Juno**：`反派`');
  assert.equal(plain, '角色表 Juno：反派');
});
