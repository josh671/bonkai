import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkImages() {
  const introPhotosDir = join(__dirname, '..', 'src', 'Intro', 'IntroPhotos');
  const files = await readdir(introPhotosDir);
  const webpFiles = files.filter(f => f.endsWith('.webp')).slice(0, 3);

  console.log('Checking image dimensions:\n');

  for (const file of webpFiles) {
    const filePath = join(introPhotosDir, file);
    const metadata = await sharp(filePath).metadata();
    const stats = await sharp(filePath).stats();

    console.log(`${file}:`);
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}px`);
    console.log(`  File size: ${(metadata.size / 1024 / 1024).toFixed(2)}MB`);
    console.log('');
  }
}

checkImages().catch(console.error);
