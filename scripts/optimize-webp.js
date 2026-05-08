import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Max width for images (height will scale proportionally)
// 1600px is enough for high-DPI displays while being much smaller than original
const MAX_WIDTH = 1600;
const QUALITY = 85; // Slightly higher quality since we're reducing dimensions

async function getAllWebPFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      await getAllWebPFiles(filePath, fileList);
    } else if (file.name.endsWith('.webp')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function optimizeWebP(imagePath) {
  try {
    const fs = await import('fs/promises');
    const metadata = await sharp(imagePath).metadata();
    const originalSize = (metadata.size / 1024 / 1024).toFixed(2);

    // Create temporary output path
    const tempPath = imagePath + '.optimized';

    // Resize and optimize
    await sharp(imagePath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({
        quality: QUALITY,
        effort: 6
      })
      .toFile(tempPath);

    // Check new size
    const newMetadata = await sharp(tempPath).metadata();
    const newSize = (newMetadata.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - newMetadata.size / metadata.size) * 100).toFixed(0);

    // Copy optimized file over original using buffer to avoid file lock issues
    const buffer = await fs.readFile(tempPath);
    await fs.writeFile(imagePath, buffer);

    // Delete temp file
    await fs.unlink(tempPath);

    console.log(`✓ ${basename(imagePath)}`);
    console.log(`  ${metadata.width}x${metadata.height}px (${originalSize}MB) → ${newMetadata.width}x${newMetadata.height}px (${newSize}MB) [${reduction}% smaller]\n`);

  } catch (error) {
    console.error(`✗ Failed to optimize ${basename(imagePath)}:`, error.message);
  }
}

async function main() {
  const srcDir = join(__dirname, '..', 'src');
  console.log('🔍 Scanning for WebP images...\n');

  const webpFiles = await getAllWebPFiles(srcDir);

  if (webpFiles.length === 0) {
    console.log('No WebP images found.');
    return;
  }

  console.log(`Found ${webpFiles.length} WebP images. Optimizing...\n`);

  for (const imagePath of webpFiles) {
    await optimizeWebP(imagePath);
  }

  console.log(`✓ Optimization complete! Processed ${webpFiles.length} images.`);
  console.log(`\n💡 Images resized to max ${MAX_WIDTH}px width with ${QUALITY}% quality.`);
}

main().catch(console.error);
