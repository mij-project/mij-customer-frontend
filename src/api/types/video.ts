export type PresignedUrlRequest = {
  filename: string;
  content_type: string;
};

export type PresignedUrlResponse = {
  upload_url: string;
  file_url: string;
};

export type GetVideoUrlRequest = {
  video_id: string;
  user_id: string;
};

export type GetVideoUrlResponse = {
  play_url: string;
};
