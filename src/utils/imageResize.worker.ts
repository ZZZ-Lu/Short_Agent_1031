type ResizeRequest = {
  id: number;
  file: Blob;
  maxDim: number;
  quality: number;
  generate4kIfOver?: boolean;
};

self.onmessage = async ({ data }: MessageEvent<ResizeRequest>) => {
  const { id, file, maxDim, quality, generate4kIfOver } = data;
  let bitmap: ImageBitmap | undefined;
  try {
    if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
      throw new Error('Offscreen image processing is unavailable');
    }

    bitmap = await createImageBitmap(file);
    const origW = bitmap.width;
    const origH = bitmap.height;
    const isPngOrWebp = file.type === 'image/png' || file.type === 'image/webp';
    const outType = isPngOrWebp ? 'image/webp' : 'image/jpeg';

    let blob4k: Blob | undefined;
    let sourceForPreview: ImageBitmap | OffscreenCanvas = bitmap;

    if (generate4kIfOver && (origW > 4096 || origH > 4096)) {
      const scale4k = Math.min(1, 4096 / Math.max(origW, origH));
      const w4k = Math.max(1, Math.round(origW * scale4k));
      const h4k = Math.max(1, Math.round(origH * scale4k));
      const canvas4k = new OffscreenCanvas(w4k, h4k);
      const ctx4k = canvas4k.getContext('2d');
      if (ctx4k) {
        ctx4k.imageSmoothingEnabled = true;
        ctx4k.imageSmoothingQuality = 'high';
        ctx4k.drawImage(bitmap, 0, 0, w4k, h4k);
        blob4k = await canvas4k.convertToBlob({ type: outType, quality: 0.9 });
        sourceForPreview = canvas4k;
      }
    }

    const scale = Math.min(1, maxDim / Math.max(origW, origH));
    const width = Math.max(1, Math.round(origW * scale));
    const height = Math.max(1, Math.round(origH * scale));
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Offscreen 2D context is unavailable');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(sourceForPreview, 0, 0, width, height);
    const output = await canvas.convertToBlob({ type: outType, quality });
    self.postMessage({ id, blob: output, blob4k, width: origW, height: origH });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  } finally {
    bitmap?.close();
  }
};
