// src/utils/uploadToS3.ts
import axios from 'axios';

/**
 * s3アップロード処理
 * @param file
 * @param uploadUrl
 * @param onProgress
 * @returns
 */
export const uploadToS3 = async (
  file: File,
  uploadUrl: string,
  onProgress?: (percent: number) => void
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });
};
