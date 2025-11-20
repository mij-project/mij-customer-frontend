import apiClient from '@/api/axios';
import {
  PostImagePresignedUrlRequest,
  PostVideoPresignedUrlRequest,
  PutImagePresignedUrlRequest,
  PutVideoPresignedUrlRequest,
  PostImagePresignedUrlResponse,
  PostVideoPresignedUrlResponse,
  PostMediaConvertRequest,
  PostMediaConvertResponse,
  UpdateImagesPresignedUrlRequest,
  UpdateImagesPresignedUrlResponse,
  TriggerBatchProcessRequest,
  TriggerBatchProcessResponse,
} from '@/api/types/postMedia';

export const postImagePresignedUrl = async (request: PostImagePresignedUrlRequest) => {
  const { data } = await apiClient.post<PostImagePresignedUrlResponse>(
    '/media-assets/presign-image-upload',
    request
  );
  return data;
};

export const postVideoPresignedUrl = async (request: PostVideoPresignedUrlRequest) => {
  const { data } = await apiClient.post<PostVideoPresignedUrlResponse>(
    '/media-assets/presign-video-upload',
    request
  );
  return data;
};

export const putImagePresignedUrl = async (request: PutImagePresignedUrlRequest) => {
  const { data } = await apiClient.put<PostImagePresignedUrlResponse>(
    '/media-assets/presign-image-upload',
    request
  );
  return data;
};

export const putVideoPresignedUrl = async (request: PutVideoPresignedUrlRequest) => {
  const { data } = await apiClient.put<PostVideoPresignedUrlResponse>(
    '/media-assets/presign-video-upload',
    request
  );
  return data;
};

export const updateImages = async (request: UpdateImagesPresignedUrlRequest) => {
  const { data } = await apiClient.put<UpdateImagesPresignedUrlResponse>(
    '/media-assets/update-images',
    request
  );
  return data;
};

export const deleteMediaAsset = async (mediaAssetId: string) => {
  const { data } = await apiClient.delete<{ status: string; message: string }>(
    `/media-assets/media-asset/${mediaAssetId}`
  );
  return data;
};

export const triggerBatchProcess = async (request: TriggerBatchProcessRequest) => {
  const { data } = await apiClient.post<TriggerBatchProcessResponse>(
    '/media-assets/trigger-batch-process',
    request
  );
  return data;
};
