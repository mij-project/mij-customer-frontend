export type IdentityFileKind = 'front' | 'back' | 'selfie';

export type AccountFileKind = 'cover' | 'avatar';

export type PostVideoFileKind = 'main' | 'sample';

export type PostImageFileKind = 'thumbnail' | 'ogp' | 'images';

export type PostFileKind = 'main' | 'sample' | 'thumbnail' | 'ogp' | 'images';

export const POST_STATUS = {
  PENDING: 1,
  REJECTED: 2,
  UNPUBLISHED: 3,
  DELETED: 4,
  APPROVED: 5,
  RESUBMIT: 6,
  CONVERTING: 7,
  CONVERT_FAILED: 8,
} as const;

export const POST_TYPE = {
  VIDEO: 1,
  IMAGE: 2,
} as const;

export const MEDIA_ASSET_KIND = {
  OGP: 1,
  THUMBNAIL: 2,
  IMAGES: 3,
  MAIN_VIDEO: 4,
  SAMPLE_VIDEO: 5,
  IMAGE_ORIGINAL: 6,
  IMAGE_1080W: 7,
  IMAGE_MOSAIC: 8,
} as const;

export const MEDIA_ASSET_STATUS = {
  PENDING: 1,
  REJECTED: 2,
  APPROVED: 3,
  DELETED: 4,
  UNPUBLISHED: 5,
  RESUBMIT: 6,
  CONVERTING: 7,
} as const;
