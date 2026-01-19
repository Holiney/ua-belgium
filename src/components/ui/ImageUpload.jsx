import { useState, useRef, memo } from 'react';
import { X, Image, Loader2 } from 'lucide-react';
import { compressImage, formatFileSize } from '../../utils/imageCompression';

/**
 * Image Upload Component with automatic compression
 * - Compresses images to max 200KB
 * - Resizes to max 1200x1200
 * - Shows compression progress
 */
export const ImageUpload = memo(function ImageUpload({
  images = [],
  onChange,
  maxImages = 5,
  showSize = false,
}) {
  const inputRef = useRef(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    setIsCompressing(true);
    setCompressionProgress(`Обробка 0/${filesToProcess.length}...`);

    try {
      const compressedImages = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        setCompressionProgress(`Стиснення ${i + 1}/${filesToProcess.length}...`);

        const file = filesToProcess[i];
        const originalSize = file.size;

        // Compress the image
        const compressed = await compressImage(file);
        compressedImages.push(compressed);

        // Log compression results (for debugging)
        const compressedSize = Math.round((compressed.length * 3) / 4);
        console.log(
          `Image ${i + 1}: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} ` +
          `(${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`
        );
      }

      onChange([...images, ...compressedImages]);
    } catch (err) {
      console.error('Error compressing images:', err);
      alert('Помилка обробки фото. Спробуйте інше зображення.');
    } finally {
      setIsCompressing(false);
      setCompressionProgress('');
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium dark:text-gray-200">
        Фото (до {maxImages} шт.)
        {showSize && (
          <span className="text-xs text-gray-400 ml-2">
            Автоматично стискаються
          </span>
        )}
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => !isCompressing && inputRef.current?.click()}
          disabled={isCompressing}
          className={`w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-colors ${
            isCompressing
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-wait'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
        >
          {isCompressing ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {compressionProgress}
              </span>
            </>
          ) : (
            <>
              <Image className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Додати фото ({images.length}/{maxImages})
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isCompressing}
      />
    </div>
  );
});

export default ImageUpload;
