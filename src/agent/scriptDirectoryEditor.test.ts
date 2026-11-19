import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyScriptDirectoryEdit } from './scriptDirectoryEditor';
import { executeProjectReadTool, executeProjectScriptMutation, type ProjectData } from './projectTools';
import { resolveContext, summarizeToolOutputForStateNode, validateSelection } from './contextPolicy';
import { searchExperiences } from './experienceRegistry';
import { AGENT_TOOL_REGISTRY, DEFAULT_AGENT_TOOL_CONFIG } from './toolRegistry';

const SAMPLE_SCRIPT = [
  '第一集 初遇',
  '1-1 日 内 客厅',
  '人物：阿明 小雨',
  '▲阿明坐在窗边喝茶。',
  '小雨推门进来，递上一封信。',
  '1-2 夜 外 巷口',
  '▲路灯忽明忽暗。',
  '阿明快步穿过小巷。',
  '第二集 转折',
  '2-1 日 内 办公室',
  '▲文件散落一地。',
].join('\n');

function createSampleProject(scriptText = SAMPLE_SCRIPT): ProjectData {
  return {
    id: 'proj_dir_test',
    scriptText,
    characters: [],
    locations: [],
    props: [],
  };
}

test('script.editDirectory 注册在工具表、剧本工具箱、状态摘要与经验库中', () => {
  const def = AGENT_TOOL_REGISTRY.find(t => t.id === 'script.editDirectory');
  assert.ok(def, 'AGENT_TOOL_REGISTRY 应包含 script.editDirectory');
  assert.equal(def.category, '剧本与资产');
  assert.equal(def.risk, '交互动作');
  assert.equal(def.mouse, false);
  assert.equal(DEFAULT_AGENT_TOOL_CONFIG['script.editDirectory'], true);

  const enabled = Object.keys(DEFAULT_AGENT_TOOL_CONFIG);
  const expandScript = validateSelection({ categories: ['script'] }, enabled);
  const resolved0 = resolveContext(expandScript, enabled);
  assert.ok(
    resolved0.candidateTools.some(t => t.id === 'script.editDirectory'),
    '展开 script 分类应包含 script.editDirectory'
  );

  const enterExec = validateSelection({ tools: ['script.editDirectory'] }, enabled, ['script']);
  const resolved1 = resolveContext(enterExec, enabled);
  assert.ok(resolved1.tools.includes('script.editDirectory'));
  assert.ok(resolved1.prompts.includes('script'));

  const exp = searchExperiences('帮我重命名第一集的场次目录并拆分第二场');
  assert.ok(
    exp.experiences.some(e => e.id === 'script_directory_editing'),
    '经验库应能检索到 script_directory_editing'
  );
});

test('rename：支持重命名分集与场次、处理双行场次头、拦截无效格式与重名歧义', () => {
  const proj = createSampleProject();
  const dirBefore = executeProjectReadTool('script.directory', {}, proj);
  const ep1 = dirBefore.entries[0];
  const sc1 = ep1.scenes[0];

  // 重命名分集
  const renameEp = executeProjectScriptMutation(
    'script.editDirectory',
    { action: 'rename', targetId: ep1.id, newTitle: '第一集 暴风雨前夕' },
    proj
  );
  assert.equal(renameEp.output.success, true);
  assert.equal(renameEp.output.appliedCount, 1);
  assert.equal(proj.scriptText, SAMPLE_SCRIPT, '不得原地修改入参 project');
  assert.ok(renameEp.updatedProject.scriptText!.startsWith('第一集 暴风雨前夕\n'));

  // 重命名场次（直接使用上一轮返回 affectedEpisodes 中的最新唯一 ID）
  const proj2: ProjectData = { ...proj, ...renameEp.updatedProject };
  const refreshedSc1Id = (renameEp.output.affectedEpisodes as any[])[0].scenes[0].id;
  const renameSc = executeProjectScriptMutation(
    'script.editDirectory',
    { action: 'rename', targetId: refreshedSc1Id, newTitle: '1-1 黄昏 内 茶室' },
    proj2
  );
  assert.equal(renameSc.output.success, true);
  const proj3: ProjectData = { ...proj2, ...renameSc.updatedProject };
  const dirAfter = executeProjectReadTool('script.directory', {}, proj3);
  assert.equal(dirAfter.entries[0].title, '第一集 暴风雨前夕');
  assert.equal(dirAfter.entries[0].scenes[0].title, '1-1 黄昏 内 茶室');

  // 校验无效标题被拒绝（防止重命名后从目录消失）
  assert.throws(
    () =>
      applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
        action: 'rename',
        targetId: ep1.id,
        newTitle: '无集号标题',
      }),
    /不符合目录分集识别格式/
  );
  assert.throws(
    () =>
      applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
        action: 'rename',
        targetId: sc1.id,
        newTitle: '随便写一句话',
      }),
    /不符合目录场次识别格式/
  );

  // 双行场次头（如 "22-2\n日 内 房间"）重命名测试
  const twoLineScript = ['第一集', '22-2', '日 内 旧房间', '▲桌上放着一把钥匙。'].join('\n');
  const twoLineDir = executeProjectReadTool('script.directory', {}, createSampleProject(twoLineScript));
  const twoLineSceneId = twoLineDir.entries[0].scenes[0].id;

  // 1) 改为单行完整场次头时，自动清理旧的第二行元数据，不残留孤立元数据行
  const singleLineRename = applyScriptDirectoryEdit(twoLineScript, {
    action: 'rename',
    targetId: twoLineSceneId,
    newTitle: '22-2 夜 外 庭院',
  });
  assert.equal(singleLineRename.scriptText, ['第一集', '22-2 夜 外 庭院', '▲桌上放着一把钥匙。'].join('\n'));

  // 2) 仅改场次号时保留第二行元数据
  const bareNumRename = applyScriptDirectoryEdit(twoLineScript, {
    action: 'rename',
    targetId: twoLineSceneId,
    newTitle: '22-3',
  });
  assert.equal(bareNumRename.scriptText, ['第一集', '22-3', '日 内 旧房间', '▲桌上放着一把钥匙。'].join('\n'));

  // 重名场次号歧义保护
  const dupScript = ['第一集', '1-5 日 内 家中', '▲对话A', '1-5 日 外 庄园', '▲对话B'].join('\n');
  assert.throws(
    () =>
      applyScriptDirectoryEdit(dupScript, {
        action: 'rename',
        target: '1-5',
        newTitle: '1-6 日 外 新庄园',
      }),
    /同时命中了 2 个场次/
  );
});

test('add：支持按 before / after / start / end 新增分集和场次并附带可选正文', () => {
  const dir = executeProjectReadTool('script.directory', {}, createSampleProject());
  const sc1Id = dir.entries[0].scenes[0].id;

  // 在 1-1 之后插入新场次 1-3
  const addAfter = applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
    action: 'add',
    entryType: 'scene',
    title: '1-3 日 外 阳台',
    content: '▲微风吹过窗帘。',
    position: 'after',
    anchorId: sc1Id,
  });
  assert.equal(addAfter.totalScenes, 4);
  const ep1Scenes = addAfter.affectedEpisodes[0].scenes!;
  assert.deepEqual(
    ep1Scenes.map((s: any) => s.title),
    ['1-1 日 内 客厅', '1-3 日 外 阳台', '1-2 夜 外 巷口']
  );

  // 在末尾追加第三集
  const addEnd = applyScriptDirectoryEdit(addAfter.scriptText, {
    action: 'add',
    entryType: 'episode',
    title: '第三集 尾声',
    content: '3-1 日 外 车站\n▲列车缓缓驶离。',
    position: 'end',
  });
  assert.equal(addEnd.totalEpisodes, 3);
  assert.equal(addEnd.totalScenes, 5);
  assert.equal(addEnd.affectedEpisodes[2].title, '第三集 尾声');
});

test('delete：显式区分 header_only（保留正文）与 with_content（删除整块）', () => {
  const dir = executeProjectReadTool('script.directory', {}, createSampleProject());
  const sc2Id = dir.entries[0].scenes[1].id; // 1-2 夜 外 巷口

  // 默认 header_only：仅移除 1-2 标题行，正文保留并入 1-1
  const delHeader = applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
    action: 'delete',
    targetId: sc2Id,
  });
  assert.equal(delHeader.totalScenes, 2);
  assert.ok(delHeader.scriptText.includes('▲路灯忽明忽暗。'));
  assert.ok(!delHeader.scriptText.includes('1-2 夜 外 巷口'));

  // with_content：删除 1-2 标题及整块正文
  const delBlock = applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
    action: 'delete',
    targetId: sc2Id,
    deleteMode: 'with_content',
  });
  assert.equal(delBlock.totalScenes, 2);
  assert.ok(!delBlock.scriptText.includes('▲路灯忽明忽暗。'));
  assert.ok(!delBlock.scriptText.includes('阿明快步穿过小巷。'));
  assert.ok(delBlock.scriptText.includes('第二集 转折'));
});

test('split：支持按场内 1-based beforeParagraph 或 beforeLine 拆分场次', () => {
  const dir = executeProjectReadTool('script.directory', {}, createSampleProject());
  const sc1Id = dir.entries[0].scenes[0].id; // 1-1 有 2 个正文段落（人物表已跳过）

  const splitRes = applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
    action: 'split',
    targetId: sc1Id,
    beforeParagraph: 2,
    newTitle: '1-3 日 内 玄关',
  });
  assert.equal(splitRes.totalScenes, 4);
  const ep1Scenes = splitRes.affectedEpisodes[0].scenes!;
  assert.equal(ep1Scenes[0].title, '1-1 日 内 客厅');
  assert.equal(ep1Scenes[0].paragraphCount, 1);
  assert.equal(ep1Scenes[1].title, '1-3 日 内 玄关');
  assert.equal(ep1Scenes[1].paragraphCount, 1);
  assert.ok(splitRes.scriptText.includes('▲阿明坐在窗边喝茶。\n1-3 日 内 玄关\n小雨推门进来，递上一封信。'));

  // 段落越界保护
  assert.throws(
    () =>
      applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
        action: 'split',
        targetId: sc1Id,
        beforeParagraph: 99,
        newTitle: '1-9 日 内 测试',
      }),
    /超出范围/
  );
});

test('merge：支持默认合并到前一场，以及指定 mergeIntoId 合并并重命名', () => {
  const dir = executeProjectReadTool('script.directory', {}, createSampleProject());
  const sc1Id = dir.entries[0].scenes[0].id;
  const sc2Id = dir.entries[0].scenes[1].id;

  // 默认并入前一场并改名
  const mergeAdjacent = applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
    action: 'merge',
    targetId: sc2Id,
    newTitle: '1-1 夜 内外 客厅与巷口',
  });
  assert.equal(mergeAdjacent.totalScenes, 2);
  assert.equal(mergeAdjacent.affectedEpisodes[0].scenes![0].title, '1-1 夜 内外 客厅与巷口');
  assert.equal(mergeAdjacent.affectedEpisodes[0].scenes![0].paragraphCount, 4);
  assert.ok(mergeAdjacent.scriptText.includes('▲路灯忽明忽暗。'));

  // 首个条目无前驱时拒绝隐式合并
  assert.throws(
    () => applyScriptDirectoryEdit(SAMPLE_SCRIPT, { action: 'merge', targetId: sc1Id }),
    /前方没有可合并的相邻条目/
  );
});

test('move：支持调整场次与分集顺序并阻止非法自嵌套移动', () => {
  const dir = executeProjectReadTool('script.directory', {}, createSampleProject());
  const ep1Id = dir.entries[0].id;
  const sc1Id = dir.entries[0].scenes[0].id;
  const sc2Id = dir.entries[0].scenes[1].id;

  // 将 1-2 移动到 1-1 之前
  const movedScene = applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
    action: 'move',
    targetId: sc2Id,
    position: 'before',
    anchorId: sc1Id,
  });
  assert.deepEqual(
    movedScene.affectedEpisodes[0].scenes!.map((s: any) => s.title),
    ['1-2 夜 外 巷口', '1-1 日 内 客厅']
  );

  // 阻止把分集移动到其自身子场次中
  assert.throws(
    () =>
      applyScriptDirectoryEdit(SAMPLE_SCRIPT, {
        action: 'move',
        targetId: ep1Id,
        position: 'after',
        anchorId: sc1Id,
      }),
    /内部子条目/
  );
});

test('batch operations：连续多步编辑时自动追踪行号与初始 ID 漂移，结果可完全 JSON 序列化', () => {
  const proj = createSampleProject();
  const dir = executeProjectReadTool('script.directory', {}, proj);
  const sc1Id = dir.entries[0].scenes[0].id;
  const sc2Id = dir.entries[0].scenes[1].id;
  const ep2Id = dir.entries[1].id;

  // 连续 3 步均传入编辑前的原始 ID，且第 1 步拉长标题会改变后续所有字符偏移
  const batchRes = executeProjectScriptMutation(
    'script.editDirectory',
    {
      operations: [
        { action: 'rename', targetId: sc1Id, newTitle: '1-1 清晨 内 宽敞明亮的老宅客厅' },
        { action: 'rename', targetId: sc2Id, newTitle: '1-2 午夜 外 雨中幽深巷口' },
        { action: 'rename', targetId: ep2Id, newTitle: '第二集 惊天反转' },
      ],
    },
    proj
  );

  assert.equal(batchRes.output.success, true);
  assert.equal(batchRes.output.appliedCount, 3);
  const serialized = JSON.stringify(batchRes);
  assert.ok(serialized.length > 0);

  const nextProj: ProjectData = { ...proj, ...batchRes.updatedProject };
  const dirAfter = executeProjectReadTool('script.directory', {}, nextProj);
  assert.equal(dirAfter.entries[0].scenes[0].title, '1-1 清晨 内 宽敞明亮的老宅客厅');
  assert.equal(dirAfter.entries[0].scenes[1].title, '1-2 午夜 外 雨中幽深巷口');
  assert.equal(dirAfter.entries[1].title, '第二集 惊天反转');

  // 状态节点摘要输出检查
  const summary = summarizeToolOutputForStateNode('script.editDirectory', 'succeeded', batchRes.output);
  assert.ok(summary.includes('已落盘编辑目录 3 项'));
  assert.ok(summary.includes('2 集 / 3 场'));
});
