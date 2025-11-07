// 画像用拡張子取得関数
export const mimeToImageExt = (mime: string): 'jpg' | 'jpeg' | 'png' | 'pdf' => {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'application/pdf') return 'pdf';
  return 'jpg';
};

export const mimeToExt = (mime: string): string => {
  if (mime === 'video/mp4') return 'mp4';
  if (mime === 'video/avi') return 'avi';
  if (mime === 'video/mov') return 'mov';
  if (mime === 'video/wmv') return 'wmv';
  if (mime === 'video/MOV') return 'MOV';
  if (mime === 'video/quicktime') return 'mov';
  return 'mp4';
};

// S3画像URLを取得する関数
export const getImageUrl = (keyOrUrl: string | null | undefined): string => {
  if (!keyOrUrl) return '/assets/no-image.svg';

  // 既に完全なURLの場合はそのまま返す
  if (
    keyOrUrl.startsWith('http://') ||
    keyOrUrl.startsWith('https://') ||
    keyOrUrl.startsWith('/')
  ) {
    return keyOrUrl;
  }

  // S3キーの場合はCDN URLを付ける
  const cdnUrl = import.meta.env.ASSETS_URL || 'https://cdn-dev.mijfans.jp/';
  return `${cdnUrl}${keyOrUrl}`;
};
