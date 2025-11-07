/** presign結果の1件分（required_headers をそのまま送る前提） */
export type PresignedUploadItem = {
  upload_url: string;
  required_headers: Record<string, string>;
  expires_in: number;
  key: string;
};
