import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, getPixel) {
  // getPixel(x, y) returns [r, g, b, a] (0-255)
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Generate 96x96 shadow sprite
// Margin: 24px on all sides (blur spread)
// Corner radius: 16px
// Center is from x: 24..72, y: 24..72
// Box boundary: [24, 24, 72, 72]
function generateShadowSprite({ size = 96, pad = 24, radius = 16, blur = 14, dy = 6, opacity = 0.22, color = [0, 0, 0] }) {
  // Box is [pad, pad, size - pad, size - pad]
  const boxX1 = pad;
  const boxY1 = pad;
  const boxX2 = size - pad;
  const boxY2 = size - pad;

  // Signed distance function to rounded box (Inigo Quilez exact 2D rounded box SDF)
  function sdRoundedBox(px, py) {
    const cx = (boxX1 + boxX2) / 2;
    const cy = (boxY1 + boxY2) / 2 - dy; // offset box center by -dy
    const halfW = (boxX2 - boxX1) / 2;
    const halfH = (boxY2 - boxY1) / 2;

    const qx = Math.abs(px - cx) - (halfW - radius);
    const qy = Math.abs(py - cy) - (halfH - radius);

    const minMaxQ = Math.min(Math.max(qx, qy), 0);
    const hypotQ = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));

    return minMaxQ + hypotQ - radius;
  }

  return createPng(size, size, (x, y) => {
    const dist = sdRoundedBox(x + 0.5, y + 0.5);

    // If strictly inside the card, hollow it out! Alpha = 0.
    // This guarantees the sprite never obscures or discolors the card interior!
    if (dist <= -1) {
      return [0, 0, 0, 0];
    }

    // Gaussian-like falloff for dist >= 0
    let alpha = 0;
    if (dist < 0) {
      // Transition right at the card border
      alpha = opacity * (1 - Math.exp(-((dist + 1) * (dist + 1)) / (blur * blur)));
    } else {
      // Smooth bell curve falloff
      const norm = dist / blur;
      alpha = opacity * Math.exp(-norm * norm * 1.5);
    }

    const aByte = Math.min(255, Math.max(0, Math.round(alpha * 255)));
    return [color[0], color[1], color[2], aByte];
  });
}

// Ensure public dir
if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });

// 1. Idle Shadow: soft, natural ambient elevation (symmetric)
const idlePng = generateShadowSprite({
  size: 96,
  pad: 24,
  radius: 16,
  blur: 10,
  dy: 0,
  opacity: 0.16,
  color: [0, 0, 0]
});
fs.writeFileSync('public/shadow-card-idle.png', idlePng);

// 2. Hover / Active Shadow: deeper elevation (symmetric)
const hoverPng = generateShadowSprite({
  size: 96,
  pad: 24,
  radius: 16,
  blur: 14,
  dy: 0,
  opacity: 0.24,
  color: [0, 0, 0]
});
fs.writeFileSync('public/shadow-card-hover.png', hoverPng);

// 3. Selected Shadow: crisp depth elevation (symmetric)
const selectedPng = generateShadowSprite({
  size: 96,
  pad: 24,
  radius: 16,
  blur: 18,
  dy: 0,
  opacity: 0.32,
  color: [0, 0, 0]
});
fs.writeFileSync('public/shadow-card-selected.png', selectedPng);

console.log('Successfully generated public/shadow-card-*.png sprites!');
