let worker: Worker | null = null;
let requestId = 0;
export type ResizeResultWithMeta = { blob: Blob; blob4k?: Blob; width: number; height: number };
const pending = new Map<number, { resolve: (res: ResizeResultWithMeta) => void; reject: (error: Error) => void }>();

function getWorker(): Worker {
  if (typeof Worker === 'undefined') throw new Error('Web Workers are unavailable');
  if (worker) return worker;

  const instance = new Worker(new URL('./imageResize.worker.ts', import.meta.url), { type: 'module' });
  instance.onmessage = ({ data }: MessageEvent<{ id: number; blob?: Blob; blob4k?: Blob; width?: number; height?: number; error?: string }>) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error || !data.blob) request.reject(new Error(data.error || 'Image resize returned no data'));
    else request.resolve({ blob: data.blob, blob4k: data.blob4k, width: data.width || 0, height: data.height || 0 });
  };
  const failWorker = () => {
    const error = new Error('Background image processing failed');
    pending.forEach(request => request.reject(error));
    pending.clear();
    instance.terminate();
    if (worker === instance) worker = null;
  };
  instance.onerror = failWorker;
  instance.onmessageerror = failWorker;
  worker = instance;
  return instance;
}

/** Resize an image away from the UI thread and return both the resized Blob, optional 4K Blob, and source native dimensions. */
export function resizeImageWithMetaOffThread(
  file: Blob,
  maxDim: number,
  quality: number,
  generate4kIfOver = false
): Promise<ResizeResultWithMeta> {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    try {
      pending.set(id, { resolve, reject });
      getWorker().postMessage({ id, file, maxDim, quality, generate4kIfOver });
    } catch (error) {
      pending.delete(id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/** Resize an image away from the UI thread when browser worker APIs are available. */
export async function resizeImageOffThread(file: Blob, maxDim: number, quality: number): Promise<Blob> {
  const res = await resizeImageWithMetaOffThread(file, maxDim, quality, false);
  return res.blob;
}
