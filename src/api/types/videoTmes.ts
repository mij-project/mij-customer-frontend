// APIレスポンス系

export interface TempVideoMultipartInitResponse {
  s3_key: string;
  bucket: string;
  upload_id: string;
  expires_in: number;
}

export interface TempVideoPartPresignResponse {
  s3_key: string;
  upload_id: string;
  part_number: number;
  upload_url: string;
  expires_in: number;
}

export interface CompletedPart {
  part_number: number;
  etag: string;
}

export interface TempVideoMultipartCompleteRequest {
  s3_key: string;
  upload_id: string;
  parts: CompletedPart[];
}

export interface PlaybackUrlResponse {
  playback_url: string;
  expires_in: number;
}

export interface CreateSampleRequest {
  temp_video_id: string;
  start_time: number;
  end_time: number;
}

export interface SampleVideoResponse {
  sample_video_url: string;
  duration: number;
}
