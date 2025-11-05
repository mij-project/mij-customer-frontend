import { PostVideoFileKind, PostImageFileKind } from "@/constants/constants";
import { VideoFileSpec, FileSpec } from "./commons";

export interface PostVideoFileSpec {	
	post_id: string;
	kind: PostVideoFileKind;
	orientation: 'portrait' | 'landscape' | 'square';
	content_type: VideoFileSpec['content_type'];
	ext: VideoFileSpec['ext'];
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
	}
}

export interface PostVideoPresignedUrlResponse {
	uploads: {
		[K in PostVideoFileKind]: {
			key: string;
			upload_url: string;
			required_headers: Record<string, string>;
			expires_in: number;
		};
	}
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
	delete_image_ids: string[];  // 削除する画像のmedia_assets.id一覧
}

export interface UpdateImagesPresignedUrlResponse {
	uploads: Array<{
		key: string;
		upload_url: string;
		required_headers: Record<string, string>;
		expires_in: number;
	}>;
}