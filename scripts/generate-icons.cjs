const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// PNG CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePngBuffer(width, height, isMaskable = false) {
  // RGBA buffer: width * 4 per row + 1 filter byte per row
  const rowStride = width * 4;
  const rawData = Buffer.alloc((rowStride + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = isMaskable ? width * 0.38 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowStride + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color:
      // Dark Teal gradient: #0f766e to #042f2e
      let r = 13, g = 148, b = 136, a = 255; // #0d9488 base
      if (isMaskable) {
        // solid bg full bleed
        r = 15; g = 118; b = 110; // teal-700
      } else {
        // Circle background on transparent
        if (dist > outerR) {
          a = 0;
        } else {
          // slight gradient
          const factor = (y / height);
          r = Math.round(13 * (1 - factor) + 4 * factor);
          g = Math.round(148 * (1 - factor) + 47 * factor);
          b = Math.round(136 * (1 - factor) + 46 * factor);
        }
      }

      // Draw Medical Hygiene Cross / Shield inside
      // Safe area inside outerR * 0.65
      const crossSize = outerR * 0.55;
      const armWidth = outerR * 0.22;

      const inVertArm = Math.abs(dx) <= armWidth && Math.abs(dy) <= crossSize;
      const inHorizArm = Math.abs(dy) <= armWidth && Math.abs(dx) <= crossSize;

      if ((inVertArm || inHorizArm) && dist <= crossSize) {
        // White cross with slight emerald tint
        r = 255;
        g = 255;
        b = 255;
        a = 255;
      }

      // Small center dot in green/teal
      if (dist < outerR * 0.12) {
        r = 16; g = 185; b = 129; // emerald-500
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePngBuffer(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePngBuffer(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePngBuffer(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePngBuffer(180, 180, false));

// Also generate nice SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#2dd4bf" stroke-width="12" opacity="0.3"/>
  <rect x="224" y="116" width="64" height="280" rx="20" fill="#ffffff"/>
  <rect x="116" y="224" width="280" height="64" rx="20" fill="#ffffff"/>
  <circle cx="256" cy="256" r="32" fill="#10b981"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

console.log('PWA icons created successfully in public/');
