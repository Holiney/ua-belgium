/**
 * Image compression utility
 * Compresses images to reduce size while maintaining quality
 */

// Target dimensions and quality
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.7; // 70% quality - good balance
const MAX_FILE_SIZE = 200 * 1024; // Target: 200KB max per image

/**
 * Compress an image file or data URL
 * @param {File|string} input - File object or base64 data URL
 * @param {object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 data URL
 */
export async function compressImage(input, options = {}) {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    quality = QUALITY,
    maxFileSize = MAX_FILE_SIZE,
  } = options;

  // Convert input to image element
  const img = await loadImage(input);

  // Calculate new dimensions maintaining aspect ratio
  let { width, height } = img;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Try WebP first (better compression), fallback to JPEG
  let result = canvas.toDataURL('image/webp', quality);

  // If WebP not supported or too large, use JPEG
  if (!result.startsWith('data:image/webp') || getBase64Size(result) > maxFileSize) {
    result = canvas.toDataURL('image/jpeg', quality);
  }

  // If still too large, reduce quality progressively
  let currentQuality = quality;
  while (getBase64Size(result) > maxFileSize && currentQuality > 0.3) {
    currentQuality -= 0.1;
    result = canvas.toDataURL('image/jpeg', currentQuality);
  }

  return result;
}

/**
 * Compress multiple images
 * @param {Array<File|string>} images - Array of files or data URLs
 * @param {object} options - Compression options
 * @returns {Promise<string[]>} - Array of compressed data URLs
 */
export async function compressImages(images, options = {}) {
  return Promise.all(images.map(img => compressImage(img, options)));
}

/**
 * Load image from File or data URL
 */
function loadImage(input) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (input instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(input);
    } else if (typeof input === 'string') {
      img.src = input;
    } else {
      reject(new Error('Invalid input type'));
    }
  });
}

/**
 * Get approximate size of base64 string in bytes
 */
function getBase64Size(base64) {
  // Remove data URL prefix
  const base64String = base64.split(',')[1] || base64;
  // Base64 encodes 3 bytes into 4 characters
  return Math.round((base64String.length * 3) / 4);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Check if image needs compression
 */
export function needsCompression(dataUrl) {
  const size = getBase64Size(dataUrl);
  return size > MAX_FILE_SIZE;
}
