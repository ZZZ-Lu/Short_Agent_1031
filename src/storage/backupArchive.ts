import type { ScriptProject } from '../types/script';
import type { EncodedCard, Resource } from './codec';
import { normalizeProjectRecord, type StoredCardProjectHead } from './projectMeta';
import type { StorageMirrorSource } from './localFolderMirror';
import {
  importEncodedProject,
  listStoredCardProjects,
  readEncodedAssets,
  readEncodedProject,
} from '../db';

const ARCHIVE_MAGIC = 'MIRABKP1';
const ARCHIVE_MAGIC_BYTES = new TextEncoder().encode(ARCHIVE_MAGIC);

interface ArchiveAssetEntry {
  id: string;
  kind: 'blob' | 'file' | 'data';
  byteLength: number;
  mimeType?: string;
  fileName?: string;
  lastModified?: number;
}

interface ArchiveProjectEntry {
  projectId: string;
  head: {
    generation: string;
    revision: number;
    order: string[];
  };
  cards: EncodedCard[];
}

interface BackupArchiveHeader {
  version: 1;
  createdAt: number;
  projects: ScriptProject[];
  cardProjects: ArchiveProjectEntry[];
  assets: ArchiveAssetEntry[];
}

export interface ExportArchiveResult {
  blob: Blob;
  filename: string;
  projectCount: number;
  cardCount: number;
  assetCount: number;
}

export interface ImportArchiveResult {
  projects: ScriptProject[];
  restoredProjectCount: number;
  restoredCardCount: number;
  restoredAssetCount: number;
}

const defaultSource: StorageMirrorSource = {
  readEncodedProject,
  readEncodedAssets,
  importEncodedProject,
  listStoredCardProjects,
};

export async function exportBackupArchive(
  projects: ScriptProject[],
  source: StorageMirrorSource = defaultSource
): Promise<ExportArchiveResult> {
  const heads = await source.listStoredCardProjects().catch(() => [] as StoredCardProjectHead[]);
  const projectIds = new Set<string>(projects.map((p) => p.id));
  for (const head of heads) {
    if (!head.deleted && head.projectId) projectIds.add(head.projectId);
  }

  const cardProjects: ArchiveProjectEntry[] = [];
  const allAssetIds = new Set<string>();
  let totalCards = 0;

  for (const projectId of projectIds) {
    const stored = await source.readEncodedProject(projectId);
    if (!stored || stored.head.deleted) continue;
    cardProjects.push({
      projectId,
      head: {
        generation: stored.head.generation,
        revision: stored.head.revision,
        order: stored.head.order,
      },
      cards: stored.cards,
    });
    totalCards += stored.cards.length;
    for (const card of stored.cards) {
      for (const rid of card.resources || []) {
        allAssetIds.add(rid);
      }
    }
  }

  const assetEntries: ArchiveAssetEntry[] = [];
  const payloadParts: BlobPart[] = [];
  const uniqueAssetIds = [...allAssetIds];
  const textEncoder = new TextEncoder();

  for (let i = 0; i < uniqueAssetIds.length; i += 8) {
    const batch = await source.readEncodedAssets(uniqueAssetIds.slice(i, i + 8));
    for (const res of batch) {
      if (res.value == null) continue;
      if (typeof res.value === 'string') {
        const encoded = textEncoder.encode(res.value);
        assetEntries.push({
          id: res.id,
          kind: 'data',
          byteLength: encoded.byteLength,
        });
        payloadParts.push(encoded);
      } else {
        const fileVal = typeof File !== 'undefined' && res.value instanceof File ? res.value : null;
        assetEntries.push({
          id: res.id,
          kind: fileVal ? 'file' : 'blob',
          byteLength: res.value.size,
          mimeType: res.value.type || undefined,
          ...(fileVal ? { fileName: fileVal.name, lastModified: fileVal.lastModified } : {}),
        });
        payloadParts.push(res.value);
      }
    }
  }

  const header: BackupArchiveHeader = {
    version: 1,
    createdAt: Date.now(),
    projects,
    cardProjects,
    assets: assetEntries,
  };

  const headerBytes = textEncoder.encode(JSON.stringify(header));
  const lengthPrefix = new Uint8Array(4);
  new DataView(lengthPrefix.buffer).setUint32(0, headerBytes.byteLength, true);

  const blob = new Blob(
    [ARCHIVE_MAGIC_BYTES, lengthPrefix, headerBytes, ...payloadParts],
    { type: 'application/octet-stream' }
  );

  const dt = new Date();
  const stamp = [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
    '-',
    String(dt.getHours()).padStart(2, '0'),
    String(dt.getMinutes()).padStart(2, '0'),
  ].join('');

  return {
    blob,
    filename: `mira-backup-${stamp}.mira-backup`,
    projectCount: projects.length,
    cardCount: totalCards,
    assetCount: assetEntries.length,
  };
}

export async function importBackupArchive(
  archiveBlob: Blob,
  source: StorageMirrorSource = defaultSource
): Promise<ImportArchiveResult> {
  if (archiveBlob.size < 12) {
    throw new Error('备份文件损坏或格式无效');
  }
  const prefixBuf = await archiveBlob.slice(0, 12).arrayBuffer();
  const magic = new TextDecoder().decode(new Uint8Array(prefixBuf, 0, 8));
  if (magic !== ARCHIVE_MAGIC) {
    throw new Error('不是有效的 Mira 备份包 (.mira-backup)');
  }
  const headerLength = new DataView(prefixBuf).getUint32(8, true);
  if (12 + headerLength > archiveBlob.size) {
    throw new Error('备份包头部长度异常，文件可能不完整');
  }
  const headerText = await archiveBlob.slice(12, 12 + headerLength).text();
  const header = JSON.parse(headerText) as BackupArchiveHeader;
  if (!header || header.version !== 1 || !Array.isArray(header.cardProjects)) {
    throw new Error('不支持的备份包版本');
  }

  // Index asset byte ranges without loading all media into RAM at once.
  const assetSlices = new Map<string, { entry: ArchiveAssetEntry; start: number; end: number }>();
  let cursor = 12 + headerLength;
  for (const entry of header.assets || []) {
    const end = cursor + entry.byteLength;
    if (end > archiveBlob.size) {
      throw new Error(`备份包媒体段不完整 (${entry.id})`);
    }
    assetSlices.set(entry.id, { entry, start: cursor, end });
    cursor = end;
  }

  let restoredProjectCount = 0;
  let restoredCardCount = 0;
  const restoredAssetIds = new Set<string>();

  for (const projEntry of header.cardProjects) {
    const neededIds = [...new Set(projEntry.cards.flatMap((c) => c.resources || []))];
    const resources: Resource[] = [];
    for (const id of neededIds) {
      const loc = assetSlices.get(id);
      if (!loc) continue;
      const slice = archiveBlob.slice(loc.start, loc.end, loc.entry.mimeType);
      if (loc.entry.kind === 'data') {
        resources.push({ id, value: await slice.text() });
      } else if (loc.entry.kind === 'file' && typeof File !== 'undefined') {
        resources.push({
          id,
          value: new File([slice], loc.entry.fileName || id, {
            type: loc.entry.mimeType || 'application/octet-stream',
            lastModified: loc.entry.lastModified || Date.now(),
          }),
        });
      } else {
        resources.push({ id, value: slice });
      }
      restoredAssetIds.add(id);
    }

    const order = Array.isArray(projEntry.head?.order)
      ? projEntry.head.order
      : projEntry.cards.map((c) => c.id);

    await source.importEncodedProject(projEntry.projectId, projEntry.cards, order, resources);
    restoredProjectCount += 1;
    restoredCardCount += projEntry.cards.length;
  }

  const normalizedProjects = Array.isArray(header.projects)
    ? header.projects.filter(Boolean).map(normalizeProjectRecord)
    : [];

  return {
    projects: normalizedProjects,
    restoredProjectCount,
    restoredCardCount,
    restoredAssetCount: restoredAssetIds.size,
  };
}
