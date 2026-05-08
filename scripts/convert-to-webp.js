/**
 * Image Format Converter - JPG/PNG to WebP
 *
 * This script converts all JPG and PNG images in the src directory to WebP format.
 * WebP provides 25-35% better compression than JPG while maintaining similar quality.
 *
 * Usage: npm run convert:webp
 *
 * @module convert-to-webp
 * @requires sharp - High-performance image processing library
 */

import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Convert import.meta.url to __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @constant {string[]} Supported image file extensions for conversion */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

/** @constant {number} WebP quality setting (0-100). 80 provides good balance of quality and file size */
const QUALITY = 80;

/**
 * Recursively scans a directory for image files
 *
 * Traverses the directory tree and collects all files matching IMAGE_EXTENSIONS.
 * This function is recursive to handle nested folder structures.
 *
 * @param {string} dir - The directory path to scan
 * @param {string[]} fileList - Accumulator array for collecting file paths (used in recursion)
 * @returns {Promise<string[]>} Array of absolute paths to all found image files
 */
async function getAllImageFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      // Recursively scan subdirectories
      await getAllImageFiles(filePath, fileList);
    } else if (IMAGE_EXTENSIONS.includes(extname(file.name))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Converts a single image file to WebP format
 *
 * Takes an existing JPG/PNG image and creates a WebP version in the same directory.
 * The original file is preserved. Output filename replaces the original extension with .webp.
 *
 * @param {string} imagePath - Absolute path to the source image file
 * @returns {Promise<void>}
 *
 * @example
 * // Converts /path/to/photo.jpg to /path/to/photo.webp
 * await convertToWebP('/path/to/photo.jpg');
 */
async function convertToWebP(imagePath) {
  const ext = extname(imagePath);
  const outputPath = imagePath.replace(ext, '.webp');

  try {
    // Use sharp library to convert image format
    await sharp(imagePath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    console.log(`✓ Converted: ${basename(imagePath)} → ${basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${imagePath}:`, error.message);
  }
}

/**
 * Main execution function
 *
 * Orchestrates the image conversion process:
 * 1. Scans the src directory for all JPG/PNG images
 * 2. Converts each image to WebP format
 * 3. Reports conversion results
 *
 * @returns {Promise<void>}
 */
async function main() {
  const srcDir = join(__dirname, '..', 'src');
  console.log('🔍 Scanning for images...\n');

  // Find all images in the src directory tree
  const imageFiles = await getAllImageFiles(srcDir);

  if (imageFiles.length === 0) {
    console.log('No images found.');
    return;
  }

  console.log(`Found ${imageFiles.length} images. Converting to WebP...\n`);

  // Convert each image sequentially
  for (const imagePath of imageFiles) {
    await convertToWebP(imagePath);
  }

  console.log(`\n✓ Conversion complete! Converted ${imageFiles.length} images.`);
  console.log(`\n💡 Tip: Update your imports to use .webp extensions for better performance.`);
}

// Execute main function and handle any uncaught errors
main().catch(console.error);
