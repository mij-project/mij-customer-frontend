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
export const uploadTempMainVideo = async (file: File): Promise<TempVideoResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<TempVideoResponse>(
    '/video-temp/temp-upload/main-video',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * サンプル動画を切り取り生成
 */
export const createSampleVideo = async (
  request: CreateSampleRequest
): Promise<SampleVideoResponse> => {
  const response = await apiClient.post<SampleVideoResponse>(
    '/video-temp/temp-upload/create-sample',
    request
  );

  return response.data;
};
