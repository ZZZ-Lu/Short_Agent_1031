import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { StorageBackend } from '../../src/storage/backend';
import { CardRepository } from '../../src/storage/repository';
import {
  LocalFolderMirror,
  describeDiskAsset,
  type DirectoryHandleLike,
  type FileHandleLike,
  type HandlePersistenceAdapter,
  type PermissionStateLike,
  type StorageMirrorSource,
} from '../../src/storage/localFolderMirror';
import {
  exportBackupArchive,
  importBackupArchive,
} from '../../src/storage/backupArchive';
import type { LocalFolderSyncMeta } from '../../src/storage/projectMeta';
import { DEFAULT_PROJECT, type ScriptProject } from '../../src/types/script';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

class MemoryFileHandle implements FileHandleLike {
  readonly kind = 'file' as const;
  private content: Blob = new Blob([]);
  writeCount = 0;

  constructor(
    public readonly name: string,
    private onWrite?: (name: string) => void,
    private shouldFailWrite?: () => Error | null
  ) {}

  async getFile(): Promise<Blob & { text(): Promise<string> }> {
    return this.content;
  }

  async createWritable() {
    const chunks: BlobPart[] = [];
    return {
      write: async (data: Blob | ArrayBuffer | ArrayBufferView | string) => {
        const err = this.shouldFailWrite?.();
        if (err) throw err;
        chunks.push(data as BlobPart);
      },
      close: async () => {
        const err = this.shouldFailWrite?.();
        if (err) throw err;
        this.content = new Blob(chunks);
        this.writeCount += 1;
        this.onWrite?.(this.name);
      },
      abort: async () => {},
    };
  }
}

class MemoryDirectoryHandle implements DirectoryHandleLike {
  readonly kind = 'directory' as const;
  dirs = new Map<string, MemoryDirectoryHandle>();
  files = new Map<string, MemoryFileHandle>();
  permission: PermissionStateLike = 'granted';
  writeLog: string[] = [];
  nextWriteError: Error | null = null;

  constructor(public readonly name: string, private prefix = '') {}

  private fullPath(name: string) {
    return this.prefix ? `${this.prefix}/${name}` : name;
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike> {
    let dir = this.dirs.get(name);
    if (!dir) {
      if (!options?.create) throw new Error(`Directory not found: ${name}`);
      dir = new MemoryDirectoryHandle(name, this.fullPath(name));
      dir.writeLog = this.writeLog;
      this.dirs.set(name, dir);
    }
    return dir;
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike> {
    let file = this.files.get(name);
    if (!file) {
      if (!options?.create) throw new Error(`File not found: ${name}`);
      file = new MemoryFileHandle(
        name,
        (fileName) => this.writeLog.push(this.fullPath(fileName)),
        () => this.nextWriteError
      );
      this.files.set(name, file);
    }
    return file;
  }

  async *values(): AsyncIterable<FileHandleLike | DirectoryHandleLike> {
    for (const f of this.files.values()) yield f;
    for (const d of this.dirs.values()) yield d;
  }

  async queryPermission(): Promise<PermissionStateLike> {
    return this.permission;
  }

  async requestPermission(): Promise<PermissionStateLike> {
    if (this.permission === 'prompt') this.permission = 'granted';
    return this.permission;
  }
}

function createRepoHarness(dbName?: string) {
  const backend = new StorageBackend(dbName);
  const rpc = async (method: string, ...args: any[]) =>
    structuredClone(await (backend as any)[method](...structuredClone(args)));
  const repo = new CardRepository(rpc);
  const source: StorageMirrorSource = {
    readEncodedProject: (projectId) => repo.readEncodedProject(`cards_${projectId}`),
    readEncodedAssets: (ids) => repo.getEncodedAssets(ids),
    importEncodedProject: (projectId, cards, order, resources) =>
      repo.importEncodedProject(`cards_${projectId}`, cards, order, resources),
    listStoredCardProjects: () => repo.listProjectHeads(),
  };
  return { backend, repo, source };
}

function createMemoryPersistence(): HandlePersistenceAdapter & {
  storedHandle: DirectoryHandleLike | null;
  storedMeta: LocalFolderSyncMeta | null;
} {
  return {
    storedHandle: null,
    storedMeta: null,
    async saveHandle(handle) {
      this.storedHandle = handle;
    },
    async loadHandle() {
      return this.storedHandle;
    },
    async clearHandle() {
      this.storedHandle = null;
      this.storedMeta = null;
    },
    async saveSyncMeta(meta) {
      this.storedMeta = structuredClone(meta);
    },
    async loadSyncMeta() {
      return this.storedMeta ? structuredClone(this.storedMeta) : null;
    },
  };
}

function makeProject(id: string, name: string, scriptText: string): ScriptProject {
  return {
    ...DEFAULT_PROJECT,
    id,
    name,
    scriptText,
    createdAt: 1700000000000,
    updatedAt: 1700000001000,
  };
}

function makeCard(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    x: 10,
    y: 20,
    ratio: '16:9',
    res: '2K',
    state: 'completed',
    prompt: 'cinematic frame',
    imageUrl: null,
    ...extra,
  } as any;
}

test('local folder mirror writes media once, skips asset rewrites on card move, protects existing backup, and restores losslessly', async () => {
  const { repo, source } = createRepoHarness('IncrementalMirrorTestA');
  const persistence = createMemoryPersistence();
  const rootDir = new MemoryDirectoryHandle('MiraWorkspace');

  const proj = makeProject('proj_alpha', '星际序章', '第1场 飞船舰桥');
  const originalFile = new File(['png-original-bytes'], 'hero.png', {
    type: 'image/png',
    lastModified: 1700000005000,
  });
  const videoBlob = new Blob(['mp4-video-bytes'], { type: 'video/mp4' });
  const thumbDataUrl = 'data:image/webp;base64,dGh1bWI=';

  const cards = [
    makeCard('card_1', {
      fileData: originalFile,
      thumbnailUrl: thumbDataUrl,
    }),
    makeCard('card_2', {
      isVideo: true,
      fileData: videoBlob,
      videoPosterUrl: thumbDataUrl,
    }),
  ];
  await repo.save(cards, `cards_${proj.id}`);

  const mirror = new LocalFolderMirror(source, persistence, () => ({ supported: true, reason: 'ok' }));
  const { preview } = await mirror.bindFolder([proj], async () => rootDir);
  assert.equal(preview.hasExistingData, false);
  assert.equal(mirror.getSnapshot().status, 'ready');

  const assetsDir = rootDir.dirs.get('assets');
  assert.ok(assetsDir, 'assets directory created');
  const assetNames = [...assetsDir.files.keys()];
  assert.equal(assetNames.length, 3, 'one png, one mp4, one shared data.txt written');
  assert.ok(assetNames.some((n) => n.endsWith('.png')), 'PNG stored with viewable extension');
  assert.ok(assetNames.some((n) => n.endsWith('.mp4')), 'MP4 stored with viewable extension');
  assert.ok(assetNames.some((n) => n.endsWith('.data.txt')), 'data URL stored losslessly');

  const initialAssetWrites = rootDir.writeLog.filter((p) => p.startsWith('assets/')).length;
  assert.equal(initialAssetWrites, 3);

  // Move card_1 without changing any media, then trigger incremental mirror sync.
  const movedCards = [{ ...cards[0], x: 640, y: 360 }, cards[1]];
  await repo.save(movedCards, `cards_${proj.id}`);
  mirror.enqueueProjectSync(proj.id, [proj]);
  await mirror.flushQueue();

  const afterMoveAssetWrites = rootDir.writeLog.filter((p) => p.startsWith('assets/')).length;
  assert.equal(afterMoveAssetWrites, initialAssetWrites, 'moving a card rewrites zero media assets');

  // Simulate a wiped browser binding to the SAME existing disk folder: must trigger conflict-check without overwriting disk!
  const freshHarness = createRepoHarness('IncrementalMirrorTestB');
  const freshPersistence = createMemoryPersistence();
  const freshMirror = new LocalFolderMirror(
    freshHarness.source,
    freshPersistence,
    () => ({ supported: true, reason: 'ok' })
  );
  const { preview: secondPreview } = await freshMirror.bindFolder(
    [DEFAULT_PROJECT],
    async () => rootDir
  );
  assert.equal(secondPreview.hasExistingData, true);
  assert.equal(secondPreview.projectCount, 1);
  assert.equal(freshMirror.getSnapshot().status, 'conflict-check');

  // Verify projects.json on disk was NOT overwritten with DEFAULT_PROJECT
  const diskProjectsText = await (await rootDir.files.get('projects.json')!.getFile()).text();
  const diskProjects = JSON.parse(diskProjectsText) as ScriptProject[];
  assert.equal(diskProjects[0].id, proj.id);

  // Restore into the wiped browser's IndexedDB from the local folder
  const restored = await freshMirror.restoreFromFolder();
  assert.equal(restored.restoredProjectCount, 1);
  assert.equal(restored.restoredCardCount, 2);
  assert.equal(restored.restoredAssetCount, 3);
  assert.equal(restored.projects[0].name, '星际序章');
  assert.equal(restored.projects[0].scriptText, '第1场 飞船舰桥');

  // Verify File metadata extraction preserves name/mime/lastModified on native File objects
  const fileMeta = describeDiskAsset('asset-file-1', originalFile);
  assert.equal(fileMeta.kind, 'file');
  assert.equal(fileMeta.file, 'asset-file-1.png');
  assert.equal(fileMeta.fileName, 'hero.png');
  assert.equal(fileMeta.mimeType, 'image/png');

  const loadedCards = await freshHarness.repo.load(`cards_${proj.id}`);
  assert.ok(loadedCards && loadedCards.length === 2);
  assert.equal(loadedCards[0].x, 640);
  assert.equal(loadedCards[0].y, 360);
  assert.equal(loadedCards[0].thumbnailUrl, thumbDataUrl);
  assert.ok(loadedCards[0].fileData instanceof Blob);
  assert.equal(loadedCards[0].fileData.type, 'image/png');
  assert.equal(await loadedCards[0].fileData.text(), 'png-original-bytes');
  assert.equal(loadedCards[1].fileData.type, 'video/mp4');
  assert.equal(await loadedCards[1].fileData.text(), 'mp4-video-bytes');
  assert.equal(loadedCards[1].videoPosterUrl, thumbDataUrl);
});

test('permission prompt on reload and write NotAllowedError never corrupt IndexedDB state', async () => {
  const { repo, source } = createRepoHarness('IncrementalPermTest');
  const persistence = createMemoryPersistence();
  const rootDir = new MemoryDirectoryHandle('MiraWorkspace');
  const proj = makeProject('proj_perm', '权限测试', '剧本正文');
  await repo.save([makeCard('c1', { prompt: 'safe in idb' })], `cards_${proj.id}`);

  const mirror1 = new LocalFolderMirror(source, persistence, () => ({ supported: true, reason: 'ok' }));
  await mirror1.bindFolder([proj], async () => rootDir);

  // Simulate reload where browser resets permission to 'prompt'
  rootDir.permission = 'prompt';
  const mirror2 = new LocalFolderMirror(source, persistence, () => ({ supported: true, reason: 'ok' }));
  const snap = await mirror2.initialize();
  assert.equal(snap.status, 'needs-permission');
  assert.equal(snap.folderName, 'MiraWorkspace');

  const resumed = await mirror2.requestPermissionAndResume([proj]);
  assert.equal(resumed, true);
  assert.equal(mirror2.getSnapshot().status, 'ready');

  // Simulate permission revocation mid-write
  const deniedErr = new Error('Permission revoked');
  deniedErr.name = 'NotAllowedError';
  rootDir.nextWriteError = deniedErr;
  mirror2.enqueueProjectsMetaSync([proj]);
  await mirror2.flushQueue();
  assert.equal(mirror2.getSnapshot().status, 'needs-permission');

  // IndexedDB data remains completely intact
  const stillThere = await repo.load(`cards_${proj.id}`);
  assert.equal(stillThere?.length, 1);
  assert.equal(stillThere?.[0].prompt, 'safe in idb');
});

test('universal .mira-backup streaming binary archive exports and restores multi-project lossless data', async () => {
  const { repo, source } = createRepoHarness('BackupExportTest');
  const proj1 = makeProject('proj_one', '项目一', '第一幕');
  const proj2 = makeProject('proj_two', '项目二', '第二幕');

  const imgFile = new File(['raw-image-payload'], 'scene.webp', {
    type: 'image/webp',
    lastModified: 1700000010000,
  });
  const thumb = 'data:image/jpeg;base64,/9j/4AAQ';

  await repo.save(
    [makeCard('p1_c1', { fileData: imgFile, thumbnailUrl: thumb, prompt: 'shot 1' })],
    `cards_${proj1.id}`
  );
  await repo.save(
    [makeCard('p2_c1', { prompt: 'text note only', cardType: 'text', textContent: '剧本笔记' })],
    `cards_${proj2.id}`
  );

  const exported = await exportBackupArchive([proj1, proj2], source);
  assert.equal(exported.projectCount, 2);
  assert.equal(exported.cardCount, 2);
  assert.equal(exported.assetCount, 2);
  assert.ok(exported.filename.endsWith('.mira-backup'));

  // Import into a completely isolated DB
  const target = createRepoHarness('BackupImportTest');
  const imported = await importBackupArchive(exported.blob, target.source);
  assert.equal(imported.restoredProjectCount, 2);
  assert.equal(imported.restoredCardCount, 2);
  assert.equal(imported.restoredAssetCount, 2);
  assert.equal(imported.projects.length, 2);

  const restoredP1 = await target.repo.load(`cards_${proj1.id}`);
  const restoredP2 = await target.repo.load(`cards_${proj2.id}`);
  assert.equal(restoredP1?.length, 1);
  assert.ok(restoredP1?.[0].fileData instanceof Blob);
  assert.equal(restoredP1?.[0].fileData.type, 'image/webp');
  assert.equal(await restoredP1?.[0].fileData.text(), 'raw-image-payload');
  assert.equal(restoredP1?.[0].thumbnailUrl, thumb);
  assert.equal(restoredP2?.[0].textContent, '剧本笔记');

  // Corrupted archive is cleanly rejected
  await assert.rejects(
    () => importBackupArchive(new Blob(['NOT_A_MIRA_ARCHIVE']), target.source),
    /不是有效的 Mira 备份包/
  );
});
