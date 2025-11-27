import { PostVideoFileKind, PostImageFileKind } from '@/constants/constants';
import { VideoFileSpec, FileSpec } from './commons';

export interface PostVideoFileSpec {
  post_id: string;
  kind: PostVideoFileKind;
  orientation: 'portrait' | 'landscape' | 'square';
  content_type: VideoFileSpec['content_type'];
  ext: VideoFileSpec['ext'];
  sample_type?: 'upload' | 'cut_out';
  sample_start_time?: number;
  sample_end_time?: number;
}

export interface PostImageFileSpec {
  post_id: string;
  kind: PostImageFileKind;
  orientation: 'portrait' | 'landscape' | 'square';
  content_type: FileSpec['content_type'];
  ext: FileSpec['ext'];
}

export interface PostVideoPresignedUrlRequest {
  files: PostVideoFileSpec[];
}

export interface PutVideoPresignedUrlRequest {
  post_id: string;
  files: PostVideoFileSpec[];
}

export interface PostImagePresignedUrlRequest {
  files: PostImageFileSpec[];
}

export interface PutImagePresignedUrlRequest {
  post_id: string;
  files: PostImageFileSpec[];
}

export interface PostImagePresignedUrlResponse {
  uploads: {
    [K in PostImageFileKind]: {
      key: string;
      upload_url: string;
      required_headers: Record<string, string>;
      expires_in: number;
    };
  };
}

export interface PostVideoPresignedUrlResponse {
  uploads: {
    [K in PostVideoFileKind]: {
      key: string;
      upload_url: string;
      required_headers: Record<string, string>;
      expires_in: number;
    };
  };
}

export interface Post {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  duration: string;
  date: string;
  isVideo?: boolean;
}

// 型定義
export interface PostData {
  post_id?: string;
  description: string;
  genres: string[];
  tags: string;
  scheduled: boolean;
  scheduledDate?: Date;
  scheduledTime?: string;
  formattedScheduledDateTime?: string;
  expiration: boolean;
  expirationDate?: Date;
  plan: boolean;
  plan_ids?: string[];
  single: boolean;
  singleDate?: string;
}

export interface PostMediaConvertRequest {
  post_id: string;
}

export interface PostMediaConvertResponse {
  status: 'success' | 'error';
}

// 画像更新用の型定義
export interface UpdateImageFileSpec {
  kind: 'images';
  orientation: 'portrait' | 'landscape' | 'square';
  content_type: FileSpec['content_type'];
  ext: FileSpec['ext'];
}

export interface UpdateImagesPresignedUrlRequest {
  post_id: string;
  add_images: UpdateImageFileSpec[];
  delete_image_ids: string[]; // 削除する画像のmedia_assets.id一覧
}

export interface UpdateImagesPresignedUrlResponse {
  uploads: Array<{
    key: string;
    upload_url: string;
    required_headers: Record<string, string>;
    expires_in: number;
  }>;
}

// バッチ処理トリガー用の型定義
export interface TriggerBatchProcessRequest {
  post_id: string;
  tmp_storage_key: string;
  need_trim: boolean;
  start_time?: number;
  end_time?: number;
  main_orientation?: 'portrait' | 'landscape' | 'square';
  sample_orientation?: 'portrait' | 'landscape' | 'square';
  content_type?: FileSpec['content_type'];
}

export interface TriggerBatchProcessResponse {
  status: string;
  message: string;
  tmp_storage_key: string;
}

// 動画変換状態チェック用の型定義
export interface CheckVideoConversionStatusResponse {
  is_converting: boolean;
  main_video_exists: boolean;
  sample_video_exists: boolean;
  message: string;
}
