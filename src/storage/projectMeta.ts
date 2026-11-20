import { DEFAULT_PROJECT, type ScriptProject } from '../types/script';

export interface StoredCardProjectHead {
  key: string;
  projectId: string;
  cardCount: number;
  revision: number;
  deleted: boolean;
  source: 'incremental' | 'legacy';
}

export interface LocalProjectsLoadResult {
  projects: ScriptProject[] | null;
  status: 'ok' | 'empty' | 'corrupt';
  rawCorrupt?: string;
}

export interface ReconcileProjectsResult {
  projects: ScriptProject[];
  recoveredProjectIds: string[];
  restoredFromIdbMeta: boolean;
  recommendedProjectId: string | null;
}

export const PROJECTS_LOCAL_STORAGE_KEY = 'script_projects';
export const PROJECTS_CORRUPT_BACKUP_KEY = 'script_projects_corrupt_backup';
const META_DB_NAME = 'InfiniteCanvasProjectMetaDB';
const META_STORE_NAME = 'meta';
const META_PROJECTS_KEY = 'script_projects';
const META_LOCAL_FOLDER_HANDLE_KEY = 'local_folder_handle';
const META_LOCAL_FOLDER_SYNC_META_KEY = 'local_folder_sync_meta';
const MAX_LOCAL_STORAGE_DATA_URL_LENGTH = 32 * 1024;

export interface LocalFolderSyncMeta {
  folderName: string;
  boundAt: number;
  lastSyncedAt: number | null;
  syncedRevisions: Record<string, number>;
}

export function normalizeProjectRecord(raw: Partial<ScriptProject>): ScriptProject {
  return {
    ...DEFAULT_PROJECT,
    ...raw,
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : DEFAULT_PROJECT.id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : DEFAULT_PROJECT.name,
    characters: Array.isArray(raw.characters) ? raw.characters.filter(Boolean) : [],
    locations: Array.isArray(raw.locations) ? raw.locations.filter(Boolean) : [],
    props: Array.isArray(raw.props) ? raw.props.filter(Boolean) : [],
    scenes: Array.isArray(raw.scenes) ? raw.scenes.filter(Boolean) : [],
    scriptText: typeof raw.scriptText === 'string' ? raw.scriptText : '',
    universe: { ...DEFAULT_PROJECT.universe, ...(raw.universe || {}) },
  };
}

function filterLegacySampleProjects(list: unknown): ScriptProject[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((p): p is Partial<ScriptProject> => Boolean(p && typeof p === 'object'))
    .filter((p) => p.id !== 'proj_blackstone_night' && p.name !== '黑石之夜')
    .map(normalizeProjectRecord);
}

export function loadProjectsFromLocalStorage(
  storage: Pick<Storage, 'getItem' | 'setItem'> | null | undefined
): LocalProjectsLoadResult {
  if (!storage) return { projects: null, status: 'empty' };
  let saved: string | null = null;
  try {
    saved = storage.getItem(PROJECTS_LOCAL_STORAGE_KEY);
  } catch {
    return { projects: null, status: 'corrupt' };
  }
  if (!saved) return { projects: null, status: 'empty' };
  try {
    const parsed = JSON.parse(saved);
    const filtered = filterLegacySampleProjects(parsed);
    if (filtered.length > 0) {
      return { projects: filtered, status: 'ok' };
    }
    return { projects: null, status: 'empty' };
  } catch {
    try {
      storage.setItem(PROJECTS_CORRUPT_BACKUP_KEY, saved);
    } catch {
      // Best-effort backup when storage is full or unavailable.
    }
    return { projects: null, status: 'corrupt', rawCorrupt: saved };
  }
}

function stripLargeDataUrlsForLocalStorage(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.startsWith('data:') && value.length > MAX_LOCAL_STORAGE_DATA_URL_LENGTH) {
      return undefined;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(stripLargeDataUrlsForLocalStorage);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const next = stripLargeDataUrlsForLocalStorage(v);
      if (next !== undefined) out[k] = next;
    }
    return out;
  }
  return value;
}

export function saveProjectsToLocalStorage(
  storage: Pick<Storage, 'setItem'> | null | undefined,
  projects: ScriptProject[]
): { ok: boolean; stripped: boolean; error?: unknown } {
  if (!storage) return { ok: false, stripped: false };
  try {
    storage.setItem(PROJECTS_LOCAL_STORAGE_KEY, JSON.stringify(projects));
    return { ok: true, stripped: false };
  } catch (firstError) {
    try {
      const compact = stripLargeDataUrlsForLocalStorage(projects);
      storage.setItem(PROJECTS_LOCAL_STORAGE_KEY, JSON.stringify(compact));
      return { ok: true, stripped: true };
    } catch (secondError) {
      return { ok: false, stripped: true, error: secondError || firstError };
    }
  }
}

function openProjectMetaDB(dbName = META_DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(META_STORE_NAME)) {
        db.createObjectStore(META_STORE_NAME);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => reject(req.error || new Error('Failed to open project meta DB'));
  });
}

export async function saveProjectsMetaToIndexedDB(
  projects: ScriptProject[],
  dbName = META_DB_NAME
): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readwrite');
    tx.objectStore(META_STORE_NAME).put(projects, META_PROJECTS_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Failed to save project metadata'));
    };
  });
}

export async function loadProjectsMetaFromIndexedDB(
  dbName = META_DB_NAME
): Promise<ScriptProject[] | null> {
  if (typeof indexedDB === 'undefined') return null;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readonly');
    const req = tx.objectStore(META_STORE_NAME).get(META_PROJECTS_KEY);
    req.onsuccess = () => {
      db.close();
      const filtered = filterLegacySampleProjects(req.result);
      resolve(filtered.length > 0 ? filtered : null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function saveLocalFolderHandle(
  handle: unknown,
  dbName = META_DB_NAME
): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readwrite');
    tx.objectStore(META_STORE_NAME).put(handle, META_LOCAL_FOLDER_HANDLE_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Failed to save local folder handle'));
    };
  });
}

export async function loadLocalFolderHandle<T = unknown>(
  dbName = META_DB_NAME
): Promise<T | null> {
  if (typeof indexedDB === 'undefined') return null;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readonly');
    const req = tx.objectStore(META_STORE_NAME).get(META_LOCAL_FOLDER_HANDLE_KEY);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as T | undefined) ?? null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function clearLocalFolderHandle(
  dbName = META_DB_NAME
): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readwrite');
    tx.objectStore(META_STORE_NAME).delete(META_LOCAL_FOLDER_HANDLE_KEY);
    tx.objectStore(META_STORE_NAME).delete(META_LOCAL_FOLDER_SYNC_META_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Failed to clear local folder handle'));
    };
  });
}

export async function saveLocalFolderSyncMeta(
  meta: LocalFolderSyncMeta,
  dbName = META_DB_NAME
): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readwrite');
    tx.objectStore(META_STORE_NAME).put(meta, META_LOCAL_FOLDER_SYNC_META_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Failed to save local folder sync metadata'));
    };
  });
}

export async function loadLocalFolderSyncMeta(
  dbName = META_DB_NAME
): Promise<LocalFolderSyncMeta | null> {
  if (typeof indexedDB === 'undefined') return null;
  const db = await openProjectMetaDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE_NAME, 'readonly');
    const req = tx.objectStore(META_STORE_NAME).get(META_LOCAL_FOLDER_SYNC_META_KEY);
    req.onsuccess = () => {
      db.close();
      const raw = req.result as Partial<LocalFolderSyncMeta> | undefined;
      if (!raw || typeof raw !== 'object' || typeof raw.folderName !== 'string') {
        resolve(null);
        return;
      }
      resolve({
        folderName: raw.folderName,
        boundAt: typeof raw.boundAt === 'number' ? raw.boundAt : Date.now(),
        lastSyncedAt: typeof raw.lastSyncedAt === 'number' ? raw.lastSyncedAt : null,
        syncedRevisions:
          raw.syncedRevisions && typeof raw.syncedRevisions === 'object'
            ? { ...raw.syncedRevisions }
            : {},
      });
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

function tryRecoverScriptFromLocalSnapshots(
  storage: Pick<Storage, 'getItem'> | null | undefined,
  projectId: string
): { scriptText: string; tocConfig?: ScriptProject['tocConfig'] } {
  if (!storage) return { scriptText: '' };
  let scriptText = '';
  let tocConfig: ScriptProject['tocConfig'] | undefined;

  try {
    const rawVersions = storage.getItem(`script_versions_${projectId}`);
    const rawStore = storage.getItem('script_scene_store');
    if (rawVersions && rawStore) {
      const versions = JSON.parse(rawVersions);
      const store = JSON.parse(rawStore) as Record<string, string>;
      if (Array.isArray(versions) && versions.length > 0 && store && typeof store === 'object') {
        const latest = versions[0];
        if (latest && Array.isArray(latest.blocks)) {
          scriptText = latest.blocks
            .map((b: { hash?: string }) => (b?.hash && typeof store[b.hash] === 'string' ? store[b.hash] : ''))
            .join('');
        }
      }
    }
  } catch {
    // Ignore malformed snapshot entries.
  }

  try {
    const rawToc = storage.getItem(`script_toc_config_${projectId}`);
    if (rawToc) {
      const parsed = JSON.parse(rawToc);
      if (parsed && typeof parsed === 'object') {
        tocConfig = parsed;
      }
    }
  } catch {
    // Ignore malformed toc config.
  }

  return { scriptText, tocConfig };
}

function formatRecoveredProjectName(head: StoredCardProjectHead): string {
  const tsMatch = /^proj_(\d{13})$/.exec(head.projectId);
  let dateSuffix = '';
  if (tsMatch) {
    const dt = new Date(Number(tsMatch[1]));
    if (!Number.isNaN(dt.getTime())) {
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      dateSuffix = ` ${mm}-${dd} ${hh}:${min}`;
    }
  }
  const countLabel = head.cardCount > 0 ? `${head.cardCount}张卡` : '空画布';
  return `恢复项目 (${countLabel}${dateSuffix})`;
}

export function reconcileProjectsWithStoredHeads(params: {
  currentProjects: ScriptProject[];
  currentProjectId: string;
  localLoadStatus: 'ok' | 'empty' | 'corrupt';
  idbMetaProjects: ScriptProject[] | null;
  storedCardHeads: StoredCardProjectHead[];
  storage?: Pick<Storage, 'getItem'> | null;
}): ReconcileProjectsResult {
  const {
    currentProjects,
    currentProjectId,
    localLoadStatus,
    idbMetaProjects,
    storedCardHeads,
    storage,
  } = params;

  const isOnlyDefaultCurrently =
    currentProjects.length === 1 && currentProjects[0]?.id === DEFAULT_PROJECT.id;

  const mergedById = new Map<string, ScriptProject>();
  let restoredFromIdbMeta = false;

  if (idbMetaProjects && idbMetaProjects.length > 0) {
    const idbHasNonDefault = idbMetaProjects.some((p) => p.id !== DEFAULT_PROJECT.id);
    if (localLoadStatus !== 'ok' || (isOnlyDefaultCurrently && idbHasNonDefault)) {
      for (const proj of idbMetaProjects) {
        mergedById.set(proj.id, normalizeProjectRecord(proj));
      }
      restoredFromIdbMeta = true;
    }
  }

  for (const proj of currentProjects) {
    if (!mergedById.has(proj.id)) {
      mergedById.set(proj.id, normalizeProjectRecord(proj));
    }
  }

  if (idbMetaProjects && idbMetaProjects.length > 0 && !restoredFromIdbMeta) {
    for (const proj of idbMetaProjects) {
      if (!mergedById.has(proj.id)) {
        mergedById.set(proj.id, normalizeProjectRecord(proj));
        restoredFromIdbMeta = true;
      }
    }
  }

  const recoveredProjectIds: string[] = [];
  const activeHeads = storedCardHeads
    .filter((h) => !h.deleted && h.projectId && h.projectId !== 'proj_blackstone_night')
    .sort((a, b) => b.cardCount - a.cardCount || b.revision - a.revision);

  for (const head of activeHeads) {
    if (mergedById.has(head.projectId)) continue;
    if (head.projectId === DEFAULT_PROJECT.id) continue;
    const recoveredSnap = tryRecoverScriptFromLocalSnapshots(storage, head.projectId);
    const tsMatch = /^proj_(\d{13})$/.exec(head.projectId);
    const createdAt = tsMatch ? Number(tsMatch[1]) : Date.now();
    const recovered: ScriptProject = {
      ...DEFAULT_PROJECT,
      id: head.projectId,
      name: formatRecoveredProjectName(head),
      logline: '',
      createdAt,
      updatedAt: Date.now(),
      scriptText: recoveredSnap.scriptText,
      ...(recoveredSnap.tocConfig ? { tocConfig: recoveredSnap.tocConfig } : {}),
      scenes: [],
      characters: [],
      locations: [],
      props: [],
    };
    mergedById.set(head.projectId, recovered);
    recoveredProjectIds.push(head.projectId);
  }

  const resultList = Array.from(mergedById.values());
  if (resultList.length === 0) {
    resultList.push(DEFAULT_PROJECT);
  }

  // Place richest recovered/non-default projects first when we recovered from default-only fallback
  const hasRealProjects = resultList.some((p) => p.id !== DEFAULT_PROJECT.id);
  const headByProjectId = new Map(activeHeads.map((h) => [h.projectId, h]));
  if (hasRealProjects && (restoredFromIdbMeta || recoveredProjectIds.length > 0)) {
    resultList.sort((a, b) => {
      if (a.id === DEFAULT_PROJECT.id && b.id !== DEFAULT_PROJECT.id) return 1;
      if (b.id === DEFAULT_PROJECT.id && a.id !== DEFAULT_PROJECT.id) return -1;
      const ha = headByProjectId.get(a.id);
      const hb = headByProjectId.get(b.id);
      return (hb?.cardCount || 0) - (ha?.cardCount || 0) || (hb?.revision || 0) - (ha?.revision || 0);
    });
  }

  let recommendedProjectId: string | null = null;
  const currentlyOnDefault = currentProjectId === DEFAULT_PROJECT.id;
  const currentMissing = !mergedById.has(currentProjectId);

  if ((currentlyOnDefault && (restoredFromIdbMeta || recoveredProjectIds.length > 0)) || currentMissing) {
    const bestNonDefault = resultList.find((p) => p.id !== DEFAULT_PROJECT.id);
    if (bestNonDefault) {
      recommendedProjectId = bestNonDefault.id;
    }
  }

  return {
    projects: resultList,
    recoveredProjectIds,
    restoredFromIdbMeta,
    recommendedProjectId,
  };
}
