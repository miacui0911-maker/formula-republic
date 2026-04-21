import imageCompression from "browser-image-compression";

/**
 * 压缩图片（保持高质量）
 * @param {File} file - 原始图片文件
 * @param {Function} onProgress - 压缩进度回调
 * @returns {Promise<File>} 压缩后的文件
 */
export async function compressImage(file, onProgress) {
  const options = {
    maxSizeMB: 8, // 最大 8MB（可根据需要调整）
    maxWidthOrHeight: 4096, // 保持 4K 分辨率（3840x2160 以上）
    useWebWorker: true, // 使用 Web Worker 不阻塞主线程
    onProgress: (progress) => {
      if (onProgress) {
        onProgress(Math.round(progress * 100));
      }
    },
  };

  try {
    const compressedFile = await imageCompression.compress(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    throw new Error(`Image compression failed: ${error.message}`);
  }
}

/**
 * 计算压缩率
 */
export function getCompressionRatio(originalSize, compressedSize) {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
