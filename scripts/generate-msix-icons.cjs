const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'src-tauri', 'icons', 'icon-source.svg');
const assetsDir = path.join(__dirname, '..', 'src-tauri', 'gen', 'windows', 'Assets');

const BG = { r: 0, g: 0, b: 0, alpha: 0 };

const tiles = [
  ['Square44x44Logo.png', 44, 44],
  ['Square44x44Logo.targetsize-16.png', 16, 16],
  ['Square44x44Logo.targetsize-24.png', 24, 24],
  ['Square44x44Logo.targetsize-32.png', 32, 32],
  ['Square44x44Logo.targetsize-48.png', 48, 48],
  ['Square44x44Logo.targetsize-256.png', 256, 256],
  ['Square150x150Logo.png', 150, 150],
  ['Square150x150Logo.scale-200.png', 300, 300],
  ['StoreLogo.png', 50, 50],
  ['Wide310x150Logo.png', 310, 150],
  ['Wide310x150Logo.scale-200.png', 620, 300],
  ['LargeTile.png', 310, 310],
];

async function generate() {
  fs.mkdirSync(assetsDir, { recursive: true });
  const svgBuffer = fs.readFileSync(svgPath);
  for (const [name, w, h] of tiles) {
    await sharp(svgBuffer)
      .resize(w, h, { fit: 'contain', background: BG })
      .png()
      .toFile(path.join(assetsDir, name));
  }
  console.log(`Generated ${tiles.length} MSIX tile icons in ${assetsDir}`);
}

generate().catch(err => { console.error(err); process.exit(1); });
