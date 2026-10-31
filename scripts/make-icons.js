const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "..", "..", "logo.jpg");

async function main() {
  const sizes = [16, 32, 48, 64, 128];
  const pngs = [];
  for (const s of sizes) {
    const buf = await sharp(SRC).resize(s, s, { fit: "cover" }).png().toBuffer();
    pngs.push({ size: s, buf });
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + 16 * pngs.length;
  const entries = [];
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(e);
  }

  const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
  fs.writeFileSync(path.join(ROOT, "public", "favicon.ico"), ico);

  await sharp(SRC).resize(180, 180, { fit: "cover" }).png().toFile(path.join(ROOT, "public", "apple-icon.png"));

  console.log("favicon.ico bytes:", ico.length, "| apple-icon.png written");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
