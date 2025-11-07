export const SHARE_VIDEO_CONSTANTS = {
	MAX_FILE_SIZE: 20 * 1024 * 1024 * 1024, // 20GB
	THUMBNAIL_SIZE: 96,
	CATEGORY_COUNT: 3,
} as const;

export const SHARE_VIDEO_VALIDATION_MESSAGES = {
	MAIN_VIDEO_REQUIRED: 'メイン動画を選択してください',
	IMAGE_REQUIRED: '画像を選択してください',
	DESCRIPTION_REQUIRED: '説明文を入力してください',
	CONFIRMATION_REQUIRED: '確認項目にチェックを入れてください',
	SCHEDULED_DATETIME_REQUIRED: '公開予約日時を設定してください',
	EXPIRATION_DATE_REQUIRED: '公開終了日時を設定してください',
	SCHEDULED_EXPIRATION_DATETIME_ERROR: '公開予約日もしくはは公開終了日は過去日付にはできません',
	PLAN_REQUIRED: 'プランを選択してください',
	SINGLE_PRICE_REQUIRED: '単発料金を設定してください',
	FILE_SIZE_ERROR: 'ファイルサイズは 20GB 以下にしてください',
	SAMPLE_VIDEO_SIZE_ERROR: 'ファイルサイズは 500MB 以下にしてください',
	IMAGE_COUNT_ERROR: '最大10枚までアップロードできます',
	CATEGORY_REQUIRED: 'カテゴリーを1つ以上選択してください',
	PLAN_ERROR: 'プランと単品販売はどれかひとつを選択してください',
} as const;