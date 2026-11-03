import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { executeProjectReadTool, executeProjectAssetMutation, type ProjectData } from './projectTools';

const project: ProjectData = { id: 'p1', scriptText: '第1集 开始\n你好\n第2集 继续\n再见', characters: [{ id: 'c1', name: 'Vivian', role: '主角', appearance: '长裙' }], locations: [{ id: 'l1', name: '车厢' }], props: [] };

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
  assert.deepEqual(result.items, [{ id: 'c1', name: 'Vivian', role: '主角', appearance: '长裙' }]);
  assert.equal(result.nextOffset, null);
  assert.throws(() => executeProjectReadTool('asset.list', { type: 'invalid' }, project));

  // Query filter
  const queryMatch = executeProjectReadTool('asset.list', { type: 'characters', query: 'vivian' }, project);
  assert.equal(queryMatch.items.length, 1);
  const queryNoMatch = executeProjectReadTool('asset.list', { type: 'characters', query: 'nonexistent' }, project);
  assert.equal(queryNoMatch.items.length, 0);
});

test('资产工具增删改 (CRUD) 操作测试', () => {
  let currentProj = { ...project, characters: [...project.characters], locations: [...project.locations], props: [...project.props] };

  // 1. asset.create (单个新增角色)
  const createRes1 = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: 'Mia',
    role: '配角',
    appearance: '黑色皮衣'
  }, currentProj);
  assert.equal(createRes1.output.success, true);
  assert.equal(createRes1.output.createdCount, 1);
  const newChar = (createRes1.output.items as any[])[0];
  assert.equal(newChar.name, 'Mia');
  assert.ok(newChar.id.startsWith('char_'));
  currentProj = { ...currentProj, ...createRes1.updatedProject };
  assert.equal(currentProj.characters.length, 2);

  // 2. asset.create (批量新增道具)
  const createProps = executeProjectAssetMutation('asset.create', {
    type: 'props',
    items: [
      { name: '车长钥匙', materialAndState: '黄铜质感' },
      { name: '登记册', materialAndState: '皮质封皮' }
    ]
  }, currentProj);
  assert.equal(createProps.output.success, true);
  assert.equal(createProps.output.createdCount, 2);
  currentProj = { ...currentProj, ...createProps.updatedProject };
  assert.equal(currentProj.props.length, 2);

  // 3. asset.update (修改资产)
  const updateRes = executeProjectAssetMutation('asset.update', {
    id: newChar.id,
    appearance: '短发，换上战术教官服'
  }, currentProj);
  assert.equal(updateRes.output.success, true);
  assert.equal((updateRes.output.item as any).appearance, '短发，换上战术教官服');
  currentProj = { ...currentProj, ...updateRes.updatedProject };
  const updatedChar = currentProj.characters.find(c => c.id === newChar.id);
  assert.equal(updatedChar.appearance, '短发，换上战术教官服');

  // 4. asset.delete (删除资产)
  const deleteRes = executeProjectAssetMutation('asset.delete', {
    id: newChar.id
  }, currentProj);
  assert.equal(deleteRes.output.success, true);
  assert.equal(deleteRes.output.deletedCount, 1);
  currentProj = { ...currentProj, ...deleteRes.updatedProject };
  assert.equal(currentProj.characters.some(c => c.id === newChar.id), false);
  assert.equal(currentProj.characters.length, 1);
});
