import apiClient from '@/api/axios';
import { 
    PostImagePresignedUrlRequest, 
    PostVideoPresignedUrlRequest, 
    PostImagePresignedUrlResponse, 
    PostVideoPresignedUrlResponse,
    PostMediaConvertRequest,
    PostMediaConvertResponse,
} from '@/api/types/postMedia';


export const postImagePresignedUrl = async (request: PostImagePresignedUrlRequest) => {
  const { data } = await apiClient.post<PostImagePresignedUrlResponse>('/media-assets/presign-image-upload', request);
  return data;
};

export const postVideoPresignedUrl = async (request: PostVideoPresignedUrlRequest) => {
  const { data } = await apiClient.post<PostVideoPresignedUrlResponse>('/media-assets/presign-video-upload', request);
  return data;
};

export const putImagePresignedUrl = async (request: PostImagePresignedUrlRequest) => {
  const { data } = await apiClient.put<PostImagePresignedUrlResponse>('/media-assets/presign-image-upload', request);
  return data;
};

export const putVideoPresignedUrl = async (request: PostVideoPresignedUrlRequest) => {
  const { data } = await apiClient.put<PostVideoPresignedUrlResponse>('/media-assets/presign-video-upload', request);
  return data;
};