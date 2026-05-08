/**
 * WebP Image Optimizer - Dimension and Quality Optimization
 *
 * This script optimizes existing WebP images by resizing them to appropriate dimensions
 * for web display while maintaining high quality. Images larger than MAX_WIDTH are resized,
 * resulting in significantly smaller file sizes without visible quality loss.
 *
 * Why 1600px?
 * - Most images are displayed at 1100px width
 * - 1600px provides 1.45x pixel density for sharp display on high-DPI screens
 * - Reduces file size by 80-90% for oversized images (4000-6000px originals)
 *
 * Safe Mode:
 * This script outputs to a separate directory (src-optimized) to prevent file locking
 * issues on Windows when the dev server is running.
 *
 * Usage: npm run optimize:safe
 *
 * @module optimize-webp-safe
 * @requires sharp - High-performance image processing library
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Convert import.meta.url to __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @constant {number} Maximum width in pixels. Height scales proportionally to maintain aspect ratio */
const MAX_WIDTH = 1600;

/** @constant {number} WebP quality setting (0-100). Higher than format conversion since we're reducing dimensions */
const QUALITY = 85;

/**
 * Recursively scans a directory for WebP files
 *
 * Traverses the directory tree and collects all .webp files.
 * This function is recursive to handle nested folder structures.
 *
 * @param {string} dir - The directory path to scan
 * @param {string[]} fileList - Accumulator array for collecting file paths (used in recursion)
 * @returns {Promise<string[]>} Array of absolute paths to all found WebP files
 */
async function getAllWebPFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      // Recursively scan subdirectories
      await getAllWebPFiles(filePath, fileList);
    } else if (file.name.endsWith('.webp')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Optimizes a single WebP image by resizing to appropriate dimensions
 *
 * This function:
 * 1. Reads the original image metadata
 * 2. Resizes the image to MAX_WIDTH (if larger), maintaining aspect ratio
 * 3. Saves optimized version to output directory, preserving folder structure
 * 4. Reports size reduction statistics
 *
 * The resize operation uses:
 * - withoutEnlargement: Prevents upscaling smaller images
 * - fit: 'inside': Maintains aspect ratio, ensures image fits within MAX_WIDTH
 * - effort: 6: Maximum compression effort for smallest file size
 *
 * @param {string} imagePath - Absolute path to the source WebP image
 * @param {string} outputDir - Root directory for optimized output
 * @returns {Promise<void>}
 *
 * @example
 * // Optimizes /src/photos/pic.webp to /src-optimized/photos/pic.webp
 * await optimizeWebP('/project/src/photos/pic.webp', '/project/src-optimized');
 */
async function optimizeWebP(imagePath, outputDir) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const originalSize = (metadata.size / 1024 / 1024).toFixed(2);

    // Create output path preserving directory structure
    const srcDir = join(__dirname, '..', 'src');
    const relativePath = relative(srcDir, imagePath);
    const outputPath = join(outputDir, relativePath);
    const outputDirPath = dirname(outputPath);

    // Create output directory if it doesn't exist
    if (!existsSync(outputDirPath)) {
      await mkdir(outputDirPath, { recursive: true });
    }

    // Resize to MAX_WIDTH (if image is larger) and optimize
    await sharp(imagePath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true, // Don't upscale images smaller than MAX_WIDTH
        fit: 'inside' // Maintain aspect ratio, fit within MAX_WIDTH
      })
      .webp({
        quality: QUALITY,
        effort: 6 // Maximum compression effort (0-6, higher = smaller files)
      })
      .toFile(outputPath);

    // Calculate and report size reduction
    const newMetadata = await sharp(outputPath).metadata();
    const newSize = (newMetadata.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - newMetadata.size / metadata.size) * 100).toFixed(0);

    console.log(`✓ ${basename(imagePath)}`);
    console.log(`  ${metadata.width}x${metadata.height}px (${originalSize}MB) → ${newMetadata.width}x${newMetadata.height}px (${newSize}MB) [${reduction}% smaller]`);

  } catch (error) {
    console.error(`✗ Failed to optimize ${basename(imagePath)}:`, error.message);
  }
}

/**
 * Main execution function
 *
 * Orchestrates the image optimization process:
 * 1. Scans the src directory for all WebP images
 * 2. Optimizes each image by resizing to appropriate dimensions
 * 3. Outputs optimized images to src-optimized directory
 * 4. Reports optimization results and next steps
 *
 * Safe Mode Rationale:
 * Outputs to a separate directory to avoid Windows file locking issues when
 * the development server has files open. User manually copies files after
 * stopping the dev server.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const srcDir = join(__dirname, '..', 'src');
  const outputDir = join(__dirname, '..', 'src-optimized');

  console.log('🔍 Scanning for WebP images...\n');

  // Find all WebP images in the src directory tree
  const webpFiles = await getAllWebPFiles(srcDir);

  if (webpFiles.length === 0) {
    console.log('No WebP images found.');
    return;
  }

  console.log(`Found ${webpFiles.length} WebP images. Optimizing to ${outputDir}...\n`);

  // Optimize each image sequentially
  for (const imagePath of webpFiles) {
    await optimizeWebP(imagePath, outputDir);
  }

  console.log(`\n✓ Optimization complete! ${webpFiles.length} images optimized.`);
  console.log(`\n📁 Optimized images saved to: ${outputDir}`);
  console.log(`\nTo use them:`);
  console.log(`1. Close your dev server`);
  console.log(`2. Copy files from src-optimized to src`);
  console.log(`3. Delete src-optimized folder`);
}

// Execute main function and handle any uncaught errors
main().catch(console.error);
