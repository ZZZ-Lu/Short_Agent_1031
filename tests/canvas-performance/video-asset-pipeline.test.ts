import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VideoPosterFailureGuard,
  buildCompletedVideoCardPatch,
  buildDemoFallbackPatch,
  isLikelyStaticImageUrl,
  isLikelyVideoMediaUrl,
  needsVideoAssetUpgrade,
  resolveVideoCardCanvasImageProps,
} from '../../src/utils/videoAssetPipeline';

test('isLikelyStaticImageUrl distinguishes static images from video streams and blob URLs', () => {
  assert.equal(isLikelyStaticImageUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'), true);
  assert.equal(isLikelyStaticImageUrl('data:image/webp;base64,AAAA'), true);
  assert.equal(isLikelyStaticImageUrl('https://cdn.example.com/poster.jpg?token=123'), true);
  assert.equal(isLikelyStaticImageUrl('https://cdn.example.com/clip.mp4?token=123'), false);
  assert.equal(isLikelyStaticImageUrl('https://cdn.example.com/clip.webm'), false);
  assert.equal(isLikelyStaticImageUrl('blob:http://localhost:3000/abc-123'), false);
  assert.equal(isLikelyStaticImageUrl('data:video/webm;base64,AAAA'), false);
  assert.equal(isLikelyStaticImageUrl(''), false);

  assert.equal(isLikelyVideoMediaUrl('https://cdn.example.com/clip.mp4?sig=1'), true);
  assert.equal(isLikelyVideoMediaUrl('data:video/mp4;base64,AAAA'), true);
  assert.equal(isLikelyVideoMediaUrl('https://images.unsplash.com/photo-123'), false);
});

test('resolveVideoCardCanvasImageProps never leaks raw video URLs into CardImageCanvas', () => {
  // Generated video card before poster is ready (no poster, no thumbnail)
  const coldVideo = resolveVideoCardCanvasImageProps({
    isVideo: true,
    imageUrl: 'https://cdn.example.com/generated-video.mp4',
    originalImageUrl: 'https://cdn.example.com/generated-video.mp4',
    blurPlaceholderUrl: 'data:image/jpeg;base64,blur',
  });
  assert.equal(coldVideo.imageUrl, undefined);
  assert.equal(coldVideo.originalImageUrl, undefined);
  assert.equal(coldVideo.thumbnailUrl, undefined);
  assert.equal(coldVideo.blurPlaceholderUrl, 'data:image/jpeg;base64,blur');

  // Video card with thumbnail only (no native videoPosterUrl yet)
  const thumbOnlyVideo = resolveVideoCardCanvasImageProps({
    isVideo: true,
    imageUrl: 'blob:http://localhost:3000/video-blob-1',
    effectiveThumbnailUrl: 'data:image/webp;base64,thumb',
  });
  assert.equal(thumbOnlyVideo.imageUrl, undefined);
  assert.equal(thumbOnlyVideo.originalImageUrl, undefined);
  assert.equal(thumbOnlyVideo.thumbnailUrl, 'data:image/webp;base64,thumb');

  // Video card with full native videoPosterUrl (parity with imported video)
  const fullPosterVideo = resolveVideoCardCanvasImageProps({
    isVideo: true,
    imageUrl: 'blob:http://localhost:3000/video-blob-2',
    effectiveVideoPosterUrl: 'data:image/webp;base64,nativePoster',
    effectiveThumbnailUrl: 'data:image/webp;base64,thumb256',
    blurPlaceholderUrl: 'data:image/webp;base64,blur64',
  });
  assert.equal(fullPosterVideo.imageUrl, 'data:image/webp;base64,nativePoster');
  assert.equal(fullPosterVideo.originalImageUrl, 'data:image/webp;base64,nativePoster');
  assert.equal(fullPosterVideo.thumbnailUrl, 'data:image/webp;base64,thumb256');
  assert.equal(fullPosterVideo.blurPlaceholderUrl, 'data:image/webp;base64,blur64');

  // Legacy demo fallback card (isVideo=true with Unsplash static image URL and no poster)
  const demoFallback = resolveVideoCardCanvasImageProps({
    isVideo: true,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
  });
  assert.equal(demoFallback.imageUrl, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800');
  assert.equal(demoFallback.thumbnailUrl, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800');

  // Regular image card keeps original image URLs intact
  const imageCard = resolveVideoCardCanvasImageProps({
    isVideo: false,
    imageUrl: 'https://cdn.example.com/proxy.jpg',
    originalImageUrl: 'https://cdn.example.com/original.png',
    effectiveThumbnailUrl: 'data:image/webp;base64,imgThumb',
  });
  assert.equal(imageCard.imageUrl, 'https://cdn.example.com/proxy.jpg');
  assert.equal(imageCard.originalImageUrl, 'https://cdn.example.com/original.png');
  assert.equal(imageCard.thumbnailUrl, 'data:image/webp;base64,imgThumb');
});

test('VideoPosterFailureGuard circuit-breaks failed or static-image URLs and resets on refresh', () => {
  const guard = new VideoPosterFailureGuard({ maxFailures: 1, cooldownMs: 60_000 });
  const videoUrl = 'https://cdn.example.com/expired-video.mp4';

  // Static image URLs are always skipped without spawning hidden <video>
  assert.equal(guard.shouldSkip('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'), true);
  assert.equal(guard.shouldSkip(videoUrl, 1000), false);

  // After a single failure, circuit breaker skips retries during cooldown
  guard.recordFailure(videoUrl, { now: 1000 });
  assert.equal(guard.shouldSkip(videoUrl, 5000), true);

  // After cooldown expires, temporary failures can retry once
  assert.equal(guard.shouldSkip(videoUrl, 62_000), false);

  // Permanent failures (e.g. non-video response) stay blocked even after cooldown
  guard.recordFailure(videoUrl, { permanent: true, now: 62_000 });
  assert.equal(guard.shouldSkip(videoUrl, 500_000), true);

  // Refreshing the URL clears the failure guard
  guard.clear(videoUrl);
  assert.equal(guard.shouldSkip(videoUrl, 500_000), false);
});

test('needsVideoAssetUpgrade detects incomplete generated video cards and skips complete imported ones', () => {
  assert.equal(
    needsVideoAssetUpgrade({
      isVideo: true,
      state: 'completed',
      imageUrl: 'https://cdn.example.com/video.mp4',
      videoPosterUrl: 'data:image/webp;base64,poster',
      thumbnailUrl: 'data:image/webp;base64,t',
      closeupThumbnailUrl: 'data:image/webp;base64,c',
      fullDetailThumbnailUrl: 'data:image/webp;base64,f',
      microLodThumbnailUrl: 'data:image/webp;base64,m',
      blurPlaceholderUrl: 'data:image/webp;base64,b',
    }),
    false
  );

  // Missing LOD pyramid tiers triggers a single guarded upgrade pass
  assert.equal(
    needsVideoAssetUpgrade({
      isVideo: true,
      state: 'completed',
      imageUrl: 'https://cdn.example.com/video.mp4',
      thumbnailUrl: 'data:image/webp;base64,t',
    }),
    true
  );

  // Generating cards or non-video cards are never upgraded prematurely
  assert.equal(
    needsVideoAssetUpgrade({
      isVideo: true,
      state: 'generating',
      imageUrl: 'https://cdn.example.com/video.mp4',
    }),
    false
  );
  assert.equal(
    needsVideoAssetUpgrade({
      isVideo: false,
      state: 'completed',
      imageUrl: 'https://cdn.example.com/img.png',
    }),
    false
  );
});

test('buildCompletedVideoCardPatch and buildDemoFallbackPatch produce imported-video parity patches', () => {
  const localBlob = new Blob(['fake-video'], { type: 'video/mp4' });
  const patch = buildCompletedVideoCardPatch({
    mediaUrl: 'https://cdn.example.com/remote.mp4',
    assets: {
      imageUrl: 'blob:http://localhost:3000/local-video',
      fileData: localBlob,
      videoPosterUrl: 'data:image/webp;base64,poster',
      thumbnailUrl: 'data:image/webp;base64,thumb',
      closeupThumbnailUrl: 'data:image/webp;base64,closeup',
      fullDetailThumbnailUrl: 'data:image/webp;base64,detail',
      microLodThumbnailUrl: 'data:image/webp;base64,micro',
      blurPlaceholderUrl: 'data:image/webp;base64,blur',
      nativeWidth: 1080,
      nativeHeight: 1920,
      videoDuration: 5.2,
    },
    mcpTaskId: 'task-123',
    lastGeneratedPrompt: 'cinematic rain scene',
  });

  assert.equal(patch.imageUrl, 'blob:http://localhost:3000/local-video');
  assert.equal(patch.fileData, localBlob);
  assert.equal(patch.videoPosterUrl, 'data:image/webp;base64,poster');
  assert.equal(patch.thumbnailUrl, 'data:image/webp;base64,thumb');
  assert.equal(patch.closeupThumbnailUrl, 'data:image/webp;base64,closeup');
  assert.equal(patch.fullDetailThumbnailUrl, 'data:image/webp;base64,detail');
  assert.equal(patch.microLodThumbnailUrl, 'data:image/webp;base64,micro');
  assert.equal(patch.blurPlaceholderUrl, 'data:image/webp;base64,blur');
  assert.equal(patch.nativeWidth, 1080);
  assert.equal(patch.nativeHeight, 1920);
  assert.equal(patch.videoDuration, 5.2);
  assert.equal(patch.state, 'completed');
  assert.equal(patch.generationError, undefined);
  assert.equal(patch.mcpTaskId, 'task-123');
  assert.equal(patch.lastGeneratedPrompt, 'cinematic rain scene');

  // Demo fallback on video cards fills static poster + LODs so no <video> upgrade loop runs
  const demoPatch = buildDemoFallbackPatch('https://images.unsplash.com/photo-123', true);
  assert.equal(demoPatch.videoPosterUrl, 'https://images.unsplash.com/photo-123');
  assert.equal(demoPatch.thumbnailUrl, 'https://images.unsplash.com/photo-123');
  assert.equal(demoPatch.closeupThumbnailUrl, 'https://images.unsplash.com/photo-123');
  assert.equal(demoPatch.fullDetailThumbnailUrl, 'https://images.unsplash.com/photo-123');
  assert.equal(demoPatch.microLodThumbnailUrl, 'https://images.unsplash.com/photo-123');
  assert.equal(demoPatch.blurPlaceholderUrl, 'https://images.unsplash.com/photo-123');
  assert.equal(
    needsVideoAssetUpgrade({
      isVideo: true,
      ...demoPatch,
    } as any),
    false
  );
});
