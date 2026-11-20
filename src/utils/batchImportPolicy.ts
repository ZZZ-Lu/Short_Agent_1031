import type { CardData } from '../components/GenerationCard';

export const BATCH_IMPORT_COMMIT_INTERVAL = 5;
export const BATCH_IMPORT_SKIP_ENTRANCE_THRESHOLD = 6;
export const MIN_SAFE_REMAINING_STORAGE_BYTES = 20 * 1024 * 1024; // 20 MB floor
export const MAX_SAFE_REMAINING_USAGE_RATIO = 0.82;

export interface ImportFileLike {
  name?: string;
  size: number;
  type: string;
}

export interface StorageEstimateLike {
  usage?: number;
  quota?: number;
}

export interface QuotaCheckResult {
  ok: boolean;
  estimatedBytes: number;
  usageBytes: number;
  quotaBytes: number;
  remainingBytes: number;
  reason?: string;
}

export function formatBytesCompact(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Estimates total IndexedDB storage required for importing a batch of local media files,
 * accounting for original Blob + 1200px proxy + optional 4K proxy + multi-tier LOD thumbnails.
 */
export function estimateImportStorageBytes(files: ImportFileLike[]): number {
  let total = 0;
  for (const file of files) {
    const rawSize = Math.max(0, Number(file.size) || 0);
    const isVideo = typeof file.type === 'string' && file.type.startsWith('video/');
    if (isVideo) {
      total += Math.round(rawSize * 1.25) + 512 * 1024;
    } else {
      total += Math.round(rawSize * 2.2) + 256 * 1024;
    }
  }
  return total;
}

export async function checkStorageQuotaForImport(
  files: ImportFileLike[],
  estimateProvider?: () => Promise<StorageEstimateLike | null | undefined>
): Promise<QuotaCheckResult> {
  const estimatedBytes = estimateImportStorageBytes(files);
  const provider =
    estimateProvider ||
    (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function'
      ? () => navigator.storage.estimate()
      : null);

  if (!provider) {
    return {
      ok: true,
      estimatedBytes,
      usageBytes: 0,
      quotaBytes: 0,
      remainingBytes: Number.POSITIVE_INFINITY,
    };
  }

  try {
    const estimate = await provider();
    const quotaBytes = Number(estimate?.quota || 0);
    const usageBytes = Number(estimate?.usage || 0);
    if (!Number.isFinite(quotaBytes) || quotaBytes <= 0) {
      return {
        ok: true,
        estimatedBytes,
        usageBytes: Math.max(0, usageBytes),
        quotaBytes: 0,
        remainingBytes: Number.POSITIVE_INFINITY,
      };
    }

    const remainingBytes = Math.max(0, quotaBytes - usageBytes);
    const projectedRemaining = remainingBytes - estimatedBytes;
    const safeBudget = remainingBytes * MAX_SAFE_REMAINING_USAGE_RATIO;

    if (estimatedBytes > safeBudget || projectedRemaining < MIN_SAFE_REMAINING_STORAGE_BYTES) {
      return {
        ok: false,
        estimatedBytes,
        usageBytes,
        quotaBytes,
        remainingBytes,
        reason: `浏览器剩余存储空间不足：本次 ${files.length} 个文件预计需要约 ${formatBytesCompact(estimatedBytes)}，当前仅剩约 ${formatBytesCompact(remainingBytes)}，请分批导入或清理空间以防触发浏览器数据清空。`,
      };
    }

    return {
      ok: true,
      estimatedBytes,
      usageBytes,
      quotaBytes,
      remainingBytes,
    };
  } catch {
    return {
      ok: true,
      estimatedBytes,
      usageBytes: 0,
      quotaBytes: 0,
      remainingBytes: Number.POSITIVE_INFINITY,
    };
  }
}

export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const name = typeof (error as any)?.name === 'string' ? (error as any).name : '';
  const msg = error instanceof Error ? error.message : String(error);
  return (
    name === 'QuotaExceededError' ||
    /QuotaExceededError|quota\s*exceeded|storage\s*full|存储空间不足|配额/i.test(msg)
  );
}

/**
 * Pure recovery pass for cards saved mid-import (e.g. after a crash, reload, or quota abort).
 * Local-import cards without an active `mcpTaskId` must never remain permanently stuck in
 * `state: 'generating'` ("正在导入...").
 */
export function recoverInterruptedImportCard(card: CardData): CardData {
  if (!card || card.state !== 'generating' || card.mcpTaskId) {
    return card;
  }
  const prompt = typeof card.prompt === 'string' ? card.prompt : '';
  const isLocalImportPrompt =
    prompt.startsWith('Dropped local') ||
    prompt.startsWith('Imported') ||
    prompt.startsWith('Pasted local');

  if (!isLocalImportPrompt) {
    return card;
  }

  const hasRenderableMedia = Boolean(
    card.imageUrl ||
    card.originalImageUrl ||
    card.trueOriginalImageUrl ||
    card.thumbnailUrl ||
    card.closeupThumbnailUrl ||
    card.videoPosterUrl ||
    card.fileData instanceof Blob ||
    card.originalFileData instanceof Blob ||
    card.trueOriginalFileData instanceof Blob
  );

  return {
    ...card,
    state: hasRenderableMedia ? 'completed' : 'draft',
  };
}
