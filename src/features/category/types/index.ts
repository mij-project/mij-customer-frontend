export interface PostCategory {
	id: string;
	post_type: number;
	description: string;
	thumbnail_url: string;
	likes_count: number;
	creator_name: string;
	username: string;
	creator_avatar_url: string;
}

export interface Category {
	id: string;
	slug: string;
	name: string;
	genre_id: string;
}

export interface Genre {
	id: string;
	slug: string;
	name: string;
}

export interface GenreWithCategories {
	id: string;
	slug: string;
	name: string;
	categories: Category[];
}