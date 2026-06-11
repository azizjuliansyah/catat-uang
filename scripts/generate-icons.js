const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create PWA icons with a simple design
async function generateIcons() {
  const sizes = [192, 512];
  const publicDir = path.join(__dirname, '..', 'public');

  for (const size of sizes) {
    // Create a square canvas with rounded corners
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}" />
        <!-- Wallet icon -->
        <rect x="${size * 0.25}" y="${size * 0.35}" width="${size * 0.5}" height="${size * 0.4}" rx="${size * 0.05}" fill="white" opacity="0.95"/>
        <rect x="${size * 0.25}" y="${size * 0.35}" width="${size * 0.5}" height="${size * 0.12}" rx="${size * 0.05}" fill="white" opacity="0.8"/>
        <circle cx="${size * 0.65}" cy="${size * 0.57}" r="${size * 0.04}" fill="#6366f1"/>
        <!-- Currency symbol (Rp) -->
        <text x="${size * 0.5}" y="${size * 0.7}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="white" text-anchor="middle">Rp</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(publicDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Also create a favicon
  const faviconSvg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#6366f1" rx="6"/>
      <text x="16" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">₮</text>
    </svg>
  `;

  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Generated favicon.png');
}

generateIcons().catch(console.error);
