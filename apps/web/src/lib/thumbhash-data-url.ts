import { thumbHashToRGBA } from "thumbhash";

/** Long side of the placeholder PNG. next/image blurs it, so detail is wasted. */
const PLACEHOLDER_SIZE = 10;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array, start: number, end: number): number {
  let c = 0xffffffff;
  for (let i = start; i < end; i++)
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Store-only (uncompressed) PNG, so it runs in the browser without zlib. */
function rgbaToPng(
  width: number,
  height: number,
  rgba: Uint8Array,
): Uint8Array {
  const row = width * 4 + 1;
  const raw = new Uint8Array(row * height);
  for (let y = 0; y < height; y++)
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * row + 1);

  let a = 1;
  let b = 0;
  for (const byte of raw) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }

  const zlibLen = 2 + 5 + raw.length + 4;
  const png = new Uint8Array(8 + 25 + (12 + zlibLen) + 12);
  const view = new DataView(png.buffer);
  png.set([137, 80, 78, 71, 13, 10, 26, 10]);

  const chunk = (offset: number, type: string, length: number): number => {
    view.setUint32(offset, length);
    for (let i = 0; i < 4; i++) png[offset + 4 + i] = type.charCodeAt(i);
    return offset + 8;
  };
  const seal = (offset: number, length: number): number => {
    view.setUint32(
      offset + 8 + length,
      crc32(png, offset + 4, offset + 8 + length),
    );
    return offset + 12 + length;
  };

  let o = 8;
  let p = chunk(o, "IHDR", 13);
  view.setUint32(p, width);
  view.setUint32(p + 4, height);
  png[p + 8] = 8; // bit depth
  png[p + 9] = 6; // RGBA
  o = seal(o, 13);

  p = chunk(o, "IDAT", zlibLen);
  png[p] = 0x78;
  png[p + 1] = 0x01;
  png[p + 2] = 1; // final stored block
  view.setUint16(p + 3, raw.length, true);
  view.setUint16(p + 5, ~raw.length & 0xffff, true);
  png.set(raw, p + 7);
  view.setUint32(p + 7 + raw.length, ((b << 16) | a) >>> 0);
  o = seal(o, zlibLen);

  chunk(o, "IEND", 0);
  seal(o, 0);
  return png;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Turns a base64 ThumbHash (see scripts/gen-thumbhashes.mjs) into a tiny PNG
 * data URL for next/image `blurDataURL`. Pure and isomorphic; the hash itself
 * is 25-35 characters, so server components pass the hash and let the card
 * expand it instead of serializing the larger data URL into every RSC payload.
 */
export function thumbHashToBlurDataURL(hash: string): string {
  const bytes = Uint8Array.from(atob(hash), (ch) => ch.charCodeAt(0));
  const { w, h, rgba } = thumbHashToRGBA(bytes);

  const scale = Math.min(1, PLACEHOLDER_SIZE / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const small = new Uint8Array(tw * th * 4);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      // Nearest sample is enough: the decoded hash is already low-frequency.
      const sx = Math.min(w - 1, Math.floor(((x + 0.5) * w) / tw));
      const sy = Math.min(h - 1, Math.floor(((y + 0.5) * h) / th));
      small.set(
        rgba.subarray((sy * w + sx) * 4, (sy * w + sx) * 4 + 4),
        (y * tw + x) * 4,
      );
    }
  }
  return `data:image/png;base64,${toBase64(rgbaToPng(tw, th, small))}`;
}
