import type { ScriptProject } from '../types/script';
import type { EncodedCard, Resource } from './codec';
import {
  clearLocalFolderHandle,
  loadLocalFolderHandle,
  loadLocalFolderSyncMeta,
  normalizeProjectRecord,
  saveLocalFolderHandle,
  saveLocalFolderSyncMeta,
  type LocalFolderSyncMeta,
  type StoredCardProjectHead,
} from './projectMeta';
import {
  importEncodedProject,
  listStoredCardProjects,
  readEncodedAssets,
  readEncodedProject,
} from '../db';

export type PermissionStateLike = 'granted' | 'denied' | 'prompt';

export interface WritableStreamLike {
  write(data: Blob | ArrayBuffer | ArrayBufferView | string): Promise<void>;
  close(): Promise<void>;
  abort?(reason?: unknown): Promise<void>;
}

export interface FileHandleLike {
  kind: 'file';
  name: string;
  getFile(): Promise<Blob & { text(): Promise<string> }>;
  createWritable(): Promise<WritableStreamLike>;
}

export interface DirectoryHandleLike {
  kind: 'directory';
  name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike>;
  removeEntry?(name: string): Promise<void>;
  values?(): AsyncIterable<FileHandleLike | DirectoryHandleLike>;
  entries?(): AsyncIterable<[string, FileHandleLike | DirectoryHandleLike]>;
  queryPermission?(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionStateLike>;
  requestPermission?(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionStateLike>;
}

export interface StorageMirrorSource {
  readEncodedProject(projectId: string): Promise<{
    head: { generation: string; revision: number; order: string[]; deleted?: boolean };
    cards: EncodedCard[];
  } | null>;
  readEncodedAssets(ids: string[]): Promise<Resource[]>;
  importEncodedProject(
    projectId: string,
    cards: EncodedCard[],
    order: string[],
    resources: Resource[]
  ): Promise<{ generation: string; revision: number; order: string[] }>;
  listStoredCardProjects(): Promise<StoredCardProjectHead[]>;
}

export interface HandlePersistenceAdapter {
  saveHandle(handle: DirectoryHandleLike): Promise<void>;
  loadHandle(): Promise<DirectoryHandleLike | null>;
  clearHandle(): Promise<void>;
  saveSyncMeta(meta: LocalFolderSyncMeta): Promise<void>;
  loadSyncMeta(): Promise<LocalFolderSyncMeta | null>;
}

export interface DiskAssetMeta {
  kind: 'blob' | 'file' | 'data';
  file: string;
  mimeType?: string;
  fileName?: string;
  lastModified?: number;
}

export interface DiskProjectFile {
  version: 1;
  projectId: string;
  syncedAt: number;
  head: {
    generation: string;
    revision: number;
    order: string[];
  };
  cards: EncodedCard[];
  assetMeta: Record<string, DiskAssetMeta>;
}

export interface DiskManifest {
  version: 1;
  app: 'mira-canvas';
  updatedAt: number;
  projectCount: number;
  projectFiles: Record<string, { file: string; revision: number; cardCount: number; syncedAt: number }>;
}

export interface FolderBackupPreview {
  hasExistingData: boolean;
  folderName: string;
  projectCount: number;
  updatedAt: number | null;
}

export interface LocalFolderSupportInfo {
  supported: boolean;
  reason: 'ok' | 'iframe' | 'unsupported-browser';
}

export type LocalFolderSyncStatus =
  | 'unbound'
  | 'needs-permission'
  | 'conflict-check'
  | 'ready'
  | 'syncing'
  | 'restoring'
  | 'error';

export interface LocalFolderMirrorSnapshot {
  support: LocalFolderSupportInfo;
  status: LocalFolderSyncStatus;
  folderName: string | null;
  lastSyncedAt: number | null;
  pendingCount: number;
  errorMessage: string | null;
  existingBackupPreview: FolderBackupPreview | null;
  syncedProjectCount: number;
}

export interface RestoreFolderResult {
  projects: ScriptProject[];
  restoredProjectCount: number;
  restoredCardCount: number;
  restoredAssetCount: number;
}

const MANIFEST_FILE = 'manifest.json';
const PROJECTS_FILE = 'projects.json';
const PROJECTS_DIR = 'projects';
const ASSETS_DIR = 'assets';
const ASSET_WRITE_BATCH_SIZE = 4;

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/webm': 'weba',
};

export function detectLocalFolderSupport(): LocalFolderSupportInfo {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'unsupported-browser' };
  }
  const hasPicker = typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function';
  if (!hasPicker) {
    return { supported: false, reason: 'unsupported-browser' };
  }
  try {
    if (window.self !== window.top) {
      return { supported: false, reason: 'iframe' };
    }
  } catch {
    return { supported: false, reason: 'iframe' };
  }
  return { supported: true, reason: 'ok' };
}

function sanitizeFileSegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function describeDiskAsset(id: string, value: Blob | string): DiskAssetMeta {
  const safeId = sanitizeFileSegment(id);
  if (typeof value === 'string') {
    return { kind: 'data', file: `${safeId}.data.txt` };
  }
  const mime = (value.type || '').toLowerCase().split(';')[0].trim();
  const ext = MIME_TO_EXT[mime] || 'bin';
  const isFile = typeof File !== 'undefined' && value instanceof File;
  return {
    kind: isFile ? 'file' : 'blob',
    file: `${safeId}.${ext}`,
    mimeType: value.type || undefined,
    ...(isFile ? { fileName: value.name, lastModified: value.lastModified } : {}),
  };
}

async function writeFileAtomic(
  dir: DirectoryHandleLike,
  filename: string,
  payload: Blob | string
): Promise<void> {
  const handle = await dir.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  try {
    await writable.write(payload);
    await writable.close();
  } catch (err) {
    await writable.abort?.(err).catch(() => {});
    throw err;
  }
}

async function readJsonFileIfExists<T>(dir: DirectoryHandleLike, filename: string): Promise<T | null> {
  try {
    const handle = await dir.getFileHandle(filename, { create: false });
    const file = await handle.getFile();
    const text = await file.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function listDirectoryFileNames(dir: DirectoryHandleLike): Promise<Set<string>> {
  const names = new Set<string>();
  if (typeof dir.values === 'function') {
    for await (const entry of dir.values()) {
      if (entry.kind === 'file') names.add(entry.name);
    }
  } else if (typeof dir.entries === 'function') {
    for await (const [name, entry] of dir.entries()) {
      if (entry.kind === 'file') names.add(name);
    }
  }
  return names;
}

export async function inspectFolderForBackup(
  handle: DirectoryHandleLike
): Promise<FolderBackupPreview> {
  const manifest = await readJsonFileIfExists<DiskManifest>(handle, MANIFEST_FILE);
  const projects = await readJsonFileIfExists<ScriptProject[]>(handle, PROJECTS_FILE);
  const projectCount = Array.isArray(projects)
    ? projects.length
    : manifest?.projectCount || 0;
  const hasManifestProjects =
    Boolean(manifest && manifest.app === 'mira-canvas' && Object.keys(manifest.projectFiles || {}).length > 0);
  const hasExistingData = hasManifestProjects || (Array.isArray(projects) && projects.length > 0);
  return {
    hasExistingData,
    folderName: handle.name,
    projectCount,
    updatedAt: typeof manifest?.updatedAt === 'number' ? manifest.updatedAt : null,
  };
}

const defaultSource: StorageMirrorSource = {
  readEncodedProject,
  readEncodedAssets,
  importEncodedProject,
  listStoredCardProjects,
};

const defaultPersistence: HandlePersistenceAdapter = {
  saveHandle: (handle) => saveLocalFolderHandle(handle),
  loadHandle: () => loadLocalFolderHandle<DirectoryHandleLike>(),
  clearHandle: () => clearLocalFolderHandle(),
  saveSyncMeta: (meta) => saveLocalFolderSyncMeta(meta),
  loadSyncMeta: () => loadLocalFolderSyncMeta(),
};

export class LocalFolderMirror {
  private handle: DirectoryHandleLike | null = null;
  private syncMeta: LocalFolderSyncMeta | null = null;
  private knownAssetFiles = new Set<string>();
  private knownAssetMeta = new Map<string, DiskAssetMeta>();
  private manifestFiles: DiskManifest['projectFiles'] = {};
  private pendingProjectIds = new Set<string>();
  private pendingProjectsList: ScriptProject[] | null = null;
  private flushRunning = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();
  private snapshot: LocalFolderMirrorSnapshot;
  private initialized = false;

  constructor(
    private source: StorageMirrorSource = defaultSource,
    private persistence: HandlePersistenceAdapter = defaultPersistence,
    private supportDetector: () => LocalFolderSupportInfo = detectLocalFolderSupport
  ) {
    this.snapshot = {
      support: this.supportDetector(),
      status: 'unbound',
      folderName: null,
      lastSyncedAt: null,
      pendingCount: 0,
      errorMessage: null,
      existingBackupPreview: null,
      syncedProjectCount: 0,
    };
  }

  getSnapshot = (): LocalFolderMirrorSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit(patch: Partial<LocalFolderMirrorSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  async initialize(): Promise<LocalFolderMirrorSnapshot> {
    if (this.initialized) return this.snapshot;
    this.initialized = true;
    const support = this.supportDetector();
    this.emit({ support });

    try {
      const [savedHandle, savedMeta] = await Promise.all([
        this.persistence.loadHandle(),
        this.persistence.loadSyncMeta(),
      ]);
      if (!savedHandle) {
        this.emit({ status: 'unbound', folderName: null, lastSyncedAt: null });
        return this.snapshot;
      }
      this.handle = savedHandle;
      this.syncMeta = savedMeta || {
        folderName: savedHandle.name,
        boundAt: Date.now(),
        lastSyncedAt: null,
        syncedRevisions: {},
      };
      const perm = savedHandle.queryPermission
        ? await savedHandle.queryPermission({ mode: 'readwrite' })
        : 'granted';

      if (perm === 'granted') {
        await this.hydrateFolderCache(savedHandle);
        this.emit({
          status: 'ready',
          folderName: savedHandle.name,
          lastSyncedAt: this.syncMeta.lastSyncedAt,
          syncedProjectCount: Object.keys(this.syncMeta.syncedRevisions).length,
          errorMessage: null,
        });
      } else {
        this.emit({
          status: 'needs-permission',
          folderName: savedHandle.name,
          lastSyncedAt: this.syncMeta.lastSyncedAt,
          syncedProjectCount: Object.keys(this.syncMeta.syncedRevisions).length,
          errorMessage: null,
        });
      }
    } catch (err) {
      this.emit({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : '读取本地同步配置失败',
      });
    }
    return this.snapshot;
  }

  private async hydrateFolderCache(handle: DirectoryHandleLike): Promise<void> {
    this.knownAssetFiles.clear();
    this.manifestFiles = {};
    try {
      const assetsDir = await handle.getDirectoryHandle(ASSETS_DIR, { create: true });
      this.knownAssetFiles = await listDirectoryFileNames(assetsDir);
    } catch {
      // Directory will be created on first asset write.
    }
    const manifest = await readJsonFileIfExists<DiskManifest>(handle, MANIFEST_FILE);
    if (manifest?.projectFiles && typeof manifest.projectFiles === 'object') {
      this.manifestFiles = { ...manifest.projectFiles };
    }
  }

  async bindFolder(
    currentProjects: ScriptProject[],
    pickerOverride?: () => Promise<DirectoryHandleLike>
  ): Promise<{ handle: DirectoryHandleLike; preview: FolderBackupPreview }> {
    const picker =
      pickerOverride ||
      (async () => {
        const support = this.supportDetector();
        if (!support.supported) {
          throw new Error(
            support.reason === 'iframe'
              ? '当前处于内嵌预览窗口，请在新标签页打开应用后再绑定本地文件夹'
              : '当前浏览器不支持本地文件夹直存，请使用 Chrome / Edge，或使用下方备份包导出'
          );
        }
        const win = window as unknown as {
          showDirectoryPicker: (options?: {
            id?: string;
            mode?: 'read' | 'readwrite';
            startIn?: string;
          }) => Promise<DirectoryHandleLike>;
        };
        return win.showDirectoryPicker({
          id: 'mira-workspace',
          mode: 'readwrite',
          startIn: 'documents',
        });
      });

    const handle = await picker();
    const preview = await inspectFolderForBackup(handle);

    this.handle = handle;
    this.knownAssetMeta.clear();
    this.syncMeta = {
      folderName: handle.name,
      boundAt: Date.now(),
      lastSyncedAt: preview.updatedAt,
      syncedRevisions: {},
    };
    await this.persistence.saveHandle(handle);
    await this.persistence.saveSyncMeta(this.syncMeta);
    await this.hydrateFolderCache(handle);

    if (preview.hasExistingData) {
      // Do NOT auto-overwrite an existing Mira backup folder — let the user explicitly pick restore or overwrite.
      this.emit({
        status: 'conflict-check',
        folderName: handle.name,
        lastSyncedAt: preview.updatedAt,
        existingBackupPreview: preview,
        errorMessage: null,
      });
      return { handle, preview };
    }

    this.emit({
      status: 'ready',
      folderName: handle.name,
      existingBackupPreview: null,
      errorMessage: null,
    });
    await this.syncAll(currentProjects);
    return { handle, preview };
  }

  async confirmOverwriteAndSync(projects: ScriptProject[]): Promise<void> {
    if (!this.handle) throw new Error('尚未绑定本地文件夹');
    this.emit({ existingBackupPreview: null, status: 'ready', errorMessage: null });
    await this.syncAll(projects);
  }

  async requestPermissionAndResume(projects?: ScriptProject[]): Promise<boolean> {
    if (!this.handle) return false;
    const perm = this.handle.requestPermission
      ? await this.handle.requestPermission({ mode: 'readwrite' })
      : 'granted';
    if (perm !== 'granted') {
      this.emit({ status: 'needs-permission', errorMessage: '未授予文件夹读写权限' });
      return false;
    }
    await this.hydrateFolderCache(this.handle);
    this.emit({ status: 'ready', errorMessage: null });
    if (projects) {
      await this.syncAll(projects);
    } else if (this.pendingProjectIds.size > 0 || this.pendingProjectsList) {
      await this.flushQueue();
    }
    return true;
  }

  async unbindFolder(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.handle = null;
    this.syncMeta = null;
    this.knownAssetFiles.clear();
    this.knownAssetMeta.clear();
    this.manifestFiles = {};
    this.pendingProjectIds.clear();
    this.pendingProjectsList = null;
    await this.persistence.clearHandle();
    this.emit({
      status: 'unbound',
      folderName: null,
      lastSyncedAt: null,
      pendingCount: 0,
      errorMessage: null,
      existingBackupPreview: null,
      syncedProjectCount: 0,
    });
  }

  enqueueProjectSync(projectId: string, projects?: ScriptProject[]): void {
    if (!this.handle || this.snapshot.status === 'conflict-check' || this.snapshot.status === 'unbound') {
      return;
    }
    this.pendingProjectIds.add(projectId);
    if (projects) this.pendingProjectsList = projects;
    this.emit({ pendingCount: this.pendingProjectIds.size });
    if (this.snapshot.status === 'needs-permission') return;
    this.scheduleFlush();
  }

  enqueueProjectsMetaSync(projects: ScriptProject[]): void {
    if (!this.handle || this.snapshot.status === 'conflict-check' || this.snapshot.status === 'unbound') {
      return;
    }
    this.pendingProjectsList = projects;
    if (this.snapshot.status === 'needs-permission') return;
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flushQueue();
    }, 450);
  }

  async flushQueue(): Promise<void> {
    if (this.flushRunning || !this.handle) return;
    if (this.snapshot.status === 'needs-permission' || this.snapshot.status === 'conflict-check') return;
    if (this.pendingProjectIds.size === 0 && !this.pendingProjectsList) return;

    this.flushRunning = true;
    this.emit({ status: 'syncing', errorMessage: null });

    try {
      while (this.handle && (this.pendingProjectIds.size > 0 || this.pendingProjectsList)) {
        const projectsToWrite = this.pendingProjectsList;
        this.pendingProjectsList = null;
        const idsToWrite = [...this.pendingProjectIds];
        this.pendingProjectIds.clear();
        this.emit({ pendingCount: 0 });

        if (projectsToWrite) {
          await writeFileAtomic(this.handle, PROJECTS_FILE, JSON.stringify(projectsToWrite, null, 2));
        }

        for (const projectId of idsToWrite) {
          await this.writeSingleProjectToDisk(this.handle, projectId);
        }

        await this.writeManifest(this.handle, projectsToWrite?.length);
      }

      const now = Date.now();
      if (this.syncMeta) {
        this.syncMeta = { ...this.syncMeta, lastSyncedAt: now };
        await this.persistence.saveSyncMeta(this.syncMeta).catch(() => {});
      }
      this.emit({
        status: 'ready',
        lastSyncedAt: now,
        syncedProjectCount: Object.keys(this.manifestFiles).length,
        errorMessage: null,
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        this.emit({
          status: 'needs-permission',
          errorMessage: '本地文件夹权限已过期，请点击重新授权以恢复同步',
        });
      } else {
        this.emit({
          status: 'error',
          errorMessage: err instanceof Error ? err.message : '写入本地文件夹失败（浏览器内数据已安全保存）',
        });
      }
    } finally {
      this.flushRunning = false;
    }
  }

  async syncAll(projects: ScriptProject[]): Promise<void> {
    if (!this.handle) throw new Error('尚未绑定本地文件夹');
    if (this.snapshot.status === 'needs-permission') {
      const granted = await this.requestPermissionAndResume();
      if (!granted) throw new Error('未授予文件夹读写权限');
    }
    this.emit({ status: 'syncing', errorMessage: null, existingBackupPreview: null });
    try {
      await writeFileAtomic(this.handle, PROJECTS_FILE, JSON.stringify(projects, null, 2));
      const heads = await this.source.listStoredCardProjects().catch(() => [] as StoredCardProjectHead[]);
      const projectIds = new Set<string>(projects.map((p) => p.id));
      for (const head of heads) {
        if (!head.deleted && head.projectId) projectIds.add(head.projectId);
      }
      for (const projectId of projectIds) {
        await this.writeSingleProjectToDisk(this.handle, projectId);
      }
      await this.writeManifest(this.handle, projects.length);
      const now = Date.now();
      if (this.syncMeta) {
        this.syncMeta = { ...this.syncMeta, lastSyncedAt: now };
        await this.persistence.saveSyncMeta(this.syncMeta).catch(() => {});
      }
      this.emit({
        status: 'ready',
        lastSyncedAt: now,
        syncedProjectCount: Object.keys(this.manifestFiles).length,
        pendingCount: 0,
        errorMessage: null,
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        this.emit({
          status: 'needs-permission',
          errorMessage: '本地文件夹权限已过期，请重新授权',
        });
      } else {
        this.emit({
          status: 'error',
          errorMessage: err instanceof Error ? err.message : '同步到本地文件夹失败',
        });
      }
      throw err;
    }
  }

  private async writeSingleProjectToDisk(handle: DirectoryHandleLike, projectId: string): Promise<void> {
    const stored = await this.source.readEncodedProject(projectId);
    if (!stored || stored.head.deleted) return;

    const projectsDir = await handle.getDirectoryHandle(PROJECTS_DIR, { create: true });
    const assetsDir = await handle.getDirectoryHandle(ASSETS_DIR, { create: true });

    const allResourceIds = [...new Set(stored.cards.flatMap((c) => c.resources || []))];
    const assetMeta: Record<string, DiskAssetMeta> = {};

    // Identify resources whose file isn't cached in memory yet or whose metadata is unknown.
    const toFetchIds: string[] = [];
    for (const id of allResourceIds) {
      const cached = this.knownAssetMeta.get(id);
      if (cached && this.knownAssetFiles.has(cached.file)) {
        assetMeta[id] = cached;
      } else {
        toFetchIds.push(id);
      }
    }

    // Read missing assets in bounded batches and write each file once.
    for (let i = 0; i < toFetchIds.length; i += ASSET_WRITE_BATCH_SIZE) {
      const batchIds = toFetchIds.slice(i, i + ASSET_WRITE_BATCH_SIZE);
      const resources = await this.source.readEncodedAssets(batchIds);
      for (const res of resources) {
        if (res.value == null) continue;
        const meta = describeDiskAsset(res.id, res.value);
        assetMeta[res.id] = meta;
        this.knownAssetMeta.set(res.id, meta);
        if (!this.knownAssetFiles.has(meta.file)) {
          await writeFileAtomic(assetsDir, meta.file, res.value);
          this.knownAssetFiles.add(meta.file);
        }
      }
    }

    const filename = `${sanitizeFileSegment(projectId)}.json`;
    const payload: DiskProjectFile = {
      version: 1,
      projectId,
      syncedAt: Date.now(),
      head: {
        generation: stored.head.generation,
        revision: stored.head.revision,
        order: stored.head.order,
      },
      cards: stored.cards,
      assetMeta,
    };
    await writeFileAtomic(projectsDir, filename, JSON.stringify(payload));
    this.manifestFiles[projectId] = {
      file: filename,
      revision: stored.head.revision,
      cardCount: stored.cards.length,
      syncedAt: payload.syncedAt,
    };
    if (this.syncMeta) {
      this.syncMeta.syncedRevisions[projectId] = stored.head.revision;
    }
  }

  private async writeManifest(handle: DirectoryHandleLike, projectCountOverride?: number): Promise<void> {
    const manifest: DiskManifest = {
      version: 1,
      app: 'mira-canvas',
      updatedAt: Date.now(),
      projectCount: projectCountOverride ?? Object.keys(this.manifestFiles).length,
      projectFiles: { ...this.manifestFiles },
    };
    await writeFileAtomic(handle, MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  }

  async restoreFromFolder(
    handleOverride?: DirectoryHandleLike
  ): Promise<RestoreFolderResult> {
    const targetHandle = handleOverride || this.handle;
    if (!targetHandle) {
      throw new Error('请先选择一个本地备份文件夹');
    }

    if (targetHandle.requestPermission) {
      const perm = await targetHandle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        throw new Error('未授予本地文件夹读取权限');
      }
    }

    this.emit({ status: 'restoring', errorMessage: null });

    try {
      const rawProjects = await readJsonFileIfExists<ScriptProject[]>(targetHandle, PROJECTS_FILE);
      const manifest = await readJsonFileIfExists<DiskManifest>(targetHandle, MANIFEST_FILE);
      const projectsDir = await targetHandle.getDirectoryHandle(PROJECTS_DIR, { create: false }).catch(() => null);
      const assetsDir = await targetHandle.getDirectoryHandle(ASSETS_DIR, { create: false }).catch(() => null);

      const projectFileNames = new Set<string>();
      if (manifest?.projectFiles) {
        Object.values(manifest.projectFiles).forEach((entry) => {
          if (entry?.file) projectFileNames.add(entry.file);
        });
      }
      if (projectsDir) {
        const listed = await listDirectoryFileNames(projectsDir);
        listed.forEach((name) => {
          if (name.endsWith('.json')) projectFileNames.add(name);
        });
      }

      if (!rawProjects && projectFileNames.size === 0) {
        throw new Error('该文件夹中未找到有效的 Mira 项目备份文件');
      }

      let restoredProjectCount = 0;
      let restoredCardCount = 0;
      const restoredAssetIds = new Set<string>();
      const importedProjectIds: string[] = [];

      if (projectsDir) {
        for (const fileName of projectFileNames) {
          const projectFile = await readJsonFileIfExists<DiskProjectFile>(projectsDir, fileName);
          if (!projectFile || !projectFile.projectId || !Array.isArray(projectFile.cards)) continue;

          const neededIds = [...new Set(projectFile.cards.flatMap((c) => c.resources || []))];
          const resources: Resource[] = [];

          if (assetsDir && neededIds.length > 0) {
            for (const id of neededIds) {
              const meta = projectFile.assetMeta?.[id];
              if (!meta?.file) continue;
              try {
                const assetFileHandle = await assetsDir.getFileHandle(meta.file, { create: false });
                const fileBlob = await assetFileHandle.getFile();
                if (meta.kind === 'data') {
                  const text = await fileBlob.text();
                  resources.push({ id, value: text });
                } else if (meta.kind === 'file' && typeof File !== 'undefined') {
                  const reconstructed = new File([fileBlob], meta.fileName || meta.file, {
                    type: meta.mimeType || fileBlob.type || 'application/octet-stream',
                    lastModified: meta.lastModified || Date.now(),
                  });
                  resources.push({ id, value: reconstructed });
                } else {
                  const typedBlob =
                    meta.mimeType && fileBlob.type !== meta.mimeType
                      ? fileBlob.slice(0, fileBlob.size, meta.mimeType)
                      : fileBlob;
                  resources.push({ id, value: typedBlob });
                }
                restoredAssetIds.add(id);
              } catch {
                // Skip missing individual asset rather than crashing whole restore if referenced asset is optional.
              }
            }
          }

          const order = Array.isArray(projectFile.head?.order)
            ? projectFile.head.order
            : projectFile.cards.map((c) => c.id);

          await this.source.importEncodedProject(
            projectFile.projectId,
            projectFile.cards,
            order,
            resources
          );
          restoredProjectCount += 1;
          restoredCardCount += projectFile.cards.length;
          importedProjectIds.push(projectFile.projectId);
        }
      }

      const normalizedProjects: ScriptProject[] = Array.isArray(rawProjects)
        ? rawProjects.filter(Boolean).map(normalizeProjectRecord)
        : [];
      const existingIds = new Set(normalizedProjects.map((p) => p.id));
      for (const pid of importedProjectIds) {
        if (!existingIds.has(pid)) {
          normalizedProjects.push(
            normalizeProjectRecord({ id: pid, name: `恢复项目 (${pid.slice(-6)})` })
          );
        }
      }

      if (targetHandle === this.handle) {
        await this.hydrateFolderCache(targetHandle);
        this.emit({
          status: 'ready',
          existingBackupPreview: null,
          syncedProjectCount: Object.keys(this.manifestFiles).length,
          errorMessage: null,
        });
      } else {
        this.emit({ status: this.handle ? 'ready' : 'unbound', errorMessage: null });
      }

      return {
        projects: normalizedProjects,
        restoredProjectCount,
        restoredCardCount,
        restoredAssetCount: restoredAssetIds.size,
      };
    } catch (err) {
      this.emit({
        status: this.handle ? 'error' : 'unbound',
        errorMessage: err instanceof Error ? err.message : '从本地文件夹恢复失败',
      });
      throw err;
    }
  }
}

export const localFolderMirror = new LocalFolderMirror();
