/**
 * 一時動画アップロード・サンプル動画切り取りAPI
 */
import apiClient from '@/api/axios';

export interface TempVideoResponse {
  temp_video_id: string;
  temp_video_url: string;
  duration?: number;
}

export interface SampleVideoResponse {
  sample_video_url: string;
  duration: number;
}

export interface CreateSampleRequest {
  temp_video_id: string;
  start_time: number;
  end_time: number;
}

/**
 * 本編動画を一時ストレージにアップロード
 */
export const uploadTempMainVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<TempVideoResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<TempVideoResponse>(
    '/video-temp/temp-upload/main-video',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data;
};

/**
 * サンプル動画を切り取り生成
 */
export const createSampleVideo = async (
  request: CreateSampleRequest,
  onProgress?: (progress: number) => void
): Promise<SampleVideoResponse> => {
  // プログレスのシミュレーション（サーバーサイド処理のため）
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 90) {
        clearInterval(interval);
      }
      if (onProgress) {
        onProgress(Math.min(progress, 90));
      }
    }, 500);
    return interval;
  };

  const progressInterval = onProgress ? simulateProgress() : null;

  try {
    const response = await apiClient.post<SampleVideoResponse>(
      '/video-temp/temp-upload/create-sample',
      request,
      {
        timeout: 120000, // 2分のタイムアウト（動画処理は時間がかかる）
      }
    );

    if (progressInterval) {
      clearInterval(progressInterval);
      onProgress?.(100);
    }

    return response.data;
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    throw error;
  }
};

/**
 * 一時ファイルを削除（投稿完了後のクリーンアップ）
 */
export const cleanupTempFiles = async (tempVideoId: string): Promise<void> => {
  try {
    await apiClient.delete(`/video-temp/cleanup/${tempVideoId}`);
  } catch (error) {
    // クリーンアップ失敗は致命的ではないため、エラーをログに記録するのみ
    console.error('一時ファイルのクリーンアップに失敗:', error);
  }
};
