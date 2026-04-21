/**
 * 分块上传工具
 * 支持大文件上传（突破 Firebase 32MB 限制）
 */

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB 每块

/**
 * 生成文件 ID
 */
function generateFileId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 上传大文件（分块）
 * @param {File} file - 要上传的文件
 * @param {Function} onProgress - 进度回调函数 (loaded, total) => {}
 * @returns {Promise<string>} 上传完成后的文件 URL
 */
export async function uploadLargeFile(file, onProgress) {
  const fileId = generateFileId();
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedBytes = 0;

  // 上传所有分块
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("chunkIndex", chunkIndex);
    formData.append("totalChunks", totalChunks);
    formData.append("fileId", fileId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Chunk ${chunkIndex} upload failed`);
      }

      uploadedBytes += chunk.size;
      if (onProgress) {
        onProgress(uploadedBytes, file.size);
      }
    } catch (error) {
      throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
    }
  }

  // 完成上传并合并文件
  try {
    const completeResponse = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,
        fileName: file.name,
        totalChunks,
        fileType: file.type,
      }),
    });

    if (!completeResponse.ok) {
      const errorData = await completeResponse.json();
      throw new Error(errorData.error || "Failed to complete upload");
    }

    const result = await completeResponse.json();
    return result.url;
  } catch (error) {
    throw new Error(`Upload completion failed: ${error.message}`);
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * 验证文件
 */
export function validateFile(file, maxSizeMB = 500) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File too large. Max: ${maxSizeMB}MB, Got: ${formatFileSize(file.size)}`,
    };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Only image files are allowed" };
  }

  return { valid: true };
}
