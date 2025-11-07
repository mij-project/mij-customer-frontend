import apiClient from '@/api/axios';
import {
  PresignedUrlRequest,
  PresignedUrlResponse,
  GetVideoUrlRequest,
  GetVideoUrlResponse,
} from '@/api/types/video';

/**
 * 動画アップロード用のpresigned urlを取得
 * @param filename ファイル名
 * @param content_type ファイルのcontent type
 * @returns
 */
export const presignedUrl = async (request: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post('/videos/upload', request);
  return response.data;
};

/**
 * 動画再生用のurlを取得
 * @param video_id 動画id
 * @param user_id ユーザーid
 * @returns
 */
export const fetchVideoPlayUrl = async (
  request: GetVideoUrlRequest
): Promise<GetVideoUrlResponse> => {
  const response = await apiClient.post('/videos/play-url', request);
  return response.data;
};
