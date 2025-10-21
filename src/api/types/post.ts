export interface CreatePostRequest {
	description: string;
	category_ids: string[];
	tags?: string;
	scheduled: boolean;
	formattedScheduledDateTime?: Date;
	expiration: boolean;
	expirationDate?: Date;
	plan: boolean;
	plan_ids?: string[];
	single: boolean;
  price?: number;
	post_type: 'video' | 'image';
}

export interface MediaInfo {
	kind: number;
	duration: number | null;
	media_assets_id: string;
	orientation: 1 | 2; // 1=縦長(Portrait)、2=横長(Landscape)
	post_id: string;
	storage_key: string;
}

export interface Plan {
	id: string;
	name: string;
	description: string;
	price: number;
}

export interface PostDetailData {
	id: string;
	post_type: 1 | 2; // 1=動画、2=画像
	description: string;
	thumbnail_key: string;
	creator: {
		username: string;
		profile_name: string;
		avatar: string;
	};
	categories: {
		id: string;
		name: string;
		slug: string;
	}[];
	media_info: MediaInfo[];
	sale_info: {
		price: number | null;
		plans: Plan[];
	};
}