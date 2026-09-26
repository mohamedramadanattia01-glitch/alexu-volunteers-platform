import fs from 'fs';
import path from 'path';

const logoPath = path.resolve('public/logo.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

// 512x512 canvas with safe 75% centered logo area
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#070c18" />
  <image href="data:image/png;base64,${logoBase64}" x="64" y="64" width="384" height="384" preserveAspectRatio="xMidYMid meet" />
</svg>`;

fs.writeFileSync(path.resolve('public/icon-maskable.svg'), svgContent, 'utf-8');
console.log('Successfully generated public/icon-maskable.svg with 75% safe area!');
