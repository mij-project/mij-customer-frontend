export interface FileSpec {
  content_type: 'image/jpeg' | 'image/png' | 'application/pdf';
  ext: 'jpg' | 'jpeg' | 'png' | 'pdf';
}

export interface VideoFileSpec {
  content_type: 'video/mp4' | 'video/avi' | 'video/mov' | 'video/wmv' | 'video/quicktime';
  ext: 'mp4' | 'avi' | 'mov' | 'wmv';
}
