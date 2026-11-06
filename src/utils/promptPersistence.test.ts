import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePromptSyncState } from './promptPersistence';

test('preserves user-saved prompt and triggers server push when container resets to default snapshot', () => {
  const local = {
    currentText: '# 自定义主循环 Prompt V2',
    savedText: '# 自定义主循环 Prompt V2',
    savedAt: 1793870000000,
    isDirty: false,
  };
  const server = {
    prompt: '# 默认旧版主循环 Prompt V1',
    updatedAt: 0,
    source: 'default' as const,
  };

  const result = resolvePromptSyncState(local, server);
  assert.equal(result.nextText, '# 自定义主循环 Prompt V2');
  assert.equal(result.nextSavedText, '# 自定义主循环 Prompt V2');
  assert.equal(result.nextSavedAt, 1793870000000);
  assert.equal(result.nextDirty, false);
  assert.equal(result.shouldPushToServer, true);
});

test('adopts server prompt when server has a newer user_saved timestamp', () => {
  const local = {
    currentText: '# 旧版保存 Prompt',
    savedText: '# 旧版保存 Prompt',
    savedAt: 1793870000000,
    isDirty: false,
  };
  const server = {
    prompt: '# 服务端更新的 Prompt',
    updatedAt: 1793880000000,
    source: 'user_saved' as const,
  };

  const result = resolvePromptSyncState(local, server);
  assert.equal(result.nextText, '# 服务端更新的 Prompt');
  assert.equal(result.nextSavedText, '# 服务端更新的 Prompt');
  assert.equal(result.nextSavedAt, 1793880000000);
  assert.equal(result.nextDirty, false);
  assert.equal(result.shouldPushToServer, false);
});

test('preserves unsaved dirty draft when switching tabs without overwriting', () => {
  const local = {
    currentText: '# 正在编辑中的草稿 Prompt',
    savedText: '# 上次保存的 Prompt',
    savedAt: 1793870000000,
    isDirty: true,
  };
  const server = {
    prompt: '# 默认旧版主循环 Prompt V1',
    updatedAt: 0,
    source: 'default' as const,
  };

  const result = resolvePromptSyncState(local, server);
  assert.equal(result.nextText, '# 正在编辑中的草稿 Prompt');
  assert.equal(result.nextDirty, true);
  assert.equal(result.shouldPushToServer, false);
});

test('force reset unconditionally adopts server prompt and clears dirty state', () => {
  const local = {
    currentText: '# 正在编辑中的草稿 Prompt',
    savedText: '# 上次保存的 Prompt',
    savedAt: 1793870000000,
    isDirty: true,
  };
  const server = {
    prompt: '# 服务端基准 Prompt',
    updatedAt: 1793870000000,
    source: 'user_saved' as const,
  };

  const result = resolvePromptSyncState(local, server, { force: true });
  assert.equal(result.nextText, '# 服务端基准 Prompt');
  assert.equal(result.nextSavedText, '# 服务端基准 Prompt');
  assert.equal(result.nextDirty, false);
  assert.equal(result.shouldPushToServer, false);
});
