import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { executeProjectReadTool } from './projectTools';

const project = { id: 'p1', scriptText: '第1集 开始\n你好\n第2集 继续\n再见', characters: [{ id: 'c1' }], locations: [{ id: 'l1' }], props: [] };

test('后台剧本工具读取目录、分页正文和搜索结果', () => {
  const directory = executeProjectReadTool('script.directory', { limit: 1 }, project);
  assert.equal(directory.projectId, 'p1');
  assert.equal(directory.total, 2);
  assert.equal(directory.nextOffset, 1);
  const page = executeProjectReadTool('script.read', { offset: 1, limit: 2 }, project);
  assert.equal(page.content, '你好\n第2集 继续');
  assert.equal(page.nextOffset, 3);
  assert.deepEqual(executeProjectReadTool('script.search', { query: '再见' }, project).matches?.map(m => m.lineNumber), [4]);
  assert.throws(() => executeProjectReadTool('script.search', { query: '' }, project));
});

test('资产工具按项目、类型和页码读取，并拒绝无效类型', () => {
  const result = executeProjectReadTool('asset.list', { type: 'characters', limit: 1 }, project);
  assert.equal(result.projectId, 'p1');
  assert.deepEqual(result.items, [{ id: 'c1' }]);
  assert.equal(result.nextOffset, null);
  assert.throws(() => executeProjectReadTool('asset.list', { type: 'invalid' }, project));
});
