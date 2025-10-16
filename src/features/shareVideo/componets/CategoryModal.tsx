import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Category, Genre } from '@/api/endpoints/categories';
import { Flame ,History ,SearchCheck } from 'lucide-react';

interface CategoryModalProps {
	categoryIndex: 1 | 2 | 3;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	currentCategory: string;
	onCategorySelect: (categoryId: string, categoryIndex: 1 | 2 | 3) => void;
	categories: Category[];
	genres: Genre[];
	recommendedCategories: Category[];
	recentCategories: Category[];
	expandedGenres: string[];
	onExpandedGenresChange: (expandedGenres: string[]) => void;
}

export default function CategoryModal({
	categoryIndex,
	isOpen,
	onOpenChange,
	currentCategory,
	onCategorySelect,
	categories,
	genres,
	recommendedCategories,
	recentCategories,
	expandedGenres,
	onExpandedGenresChange,
}: CategoryModalProps) {
	const placeholder = `カテゴリー${categoryIndex}を選択してください`;
	const title = `カテゴリー${categoryIndex}選択`;

	const handleGenreToggle = (genreId: string) => {
		if (expandedGenres.includes(genreId)) {
			onExpandedGenresChange(expandedGenres.filter(id => id !== genreId));
		} else {
			onExpandedGenresChange([...expandedGenres, genreId]);
		}
	};

	const getGenreDescription = (genreName: string): string => {
		switch (genreName) {
			case '見た目':
				return '巨乳、美身など出演者の魅力に応じたジャンル';
			case 'プレイ':
				return '絶頂位、フェラなどプレイ内容に応じたジャンル';
			case 'タイプ':
				return '素人、人妻など役柄のコンセプトに応じたジャンル';
			case 'シチュエーション':
				return 'カップル、エステなど撮影状況に応じたジャンル';
			case 'コスチューム':
				return '制服、水着など衣装に応じたジャンル';
			default:
				return '';
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Input
					readOnly
					placeholder={placeholder}
					value={currentCategory ? categories.find(cat => cat.id === currentCategory)?.name || '' : ''}
					className="cursor-pointer text-left pr-10"
				/>
			</DialogTrigger>
			<DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
				<DialogTitle className="text-lg font-medium text-center">{title}</DialogTitle>
				<DialogDescription className="sr-only">
					{placeholder}。おすすめのジャンル、直近使用したジャンル、またはカテゴリーから探すことができます。
				</DialogDescription>
				<div className="space-y-6">
					{/* おすすめのジャンル */}
					<div className="space-y-3">
						<div className="flex items-center space-x-2">
							<Flame className="w-6 h-6 text-primary" />
							<h3 className="text-sm font-medium">おすすめのジャンル</h3>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{recommendedCategories.map((category) => (
								<button
									key={category.id}
									onClick={() => onCategorySelect(category.id, categoryIndex)}
									className={`px-3 py-2 rounded-full border text-sm transition-colors ${
										currentCategory === category.id
											? 'bg-primary-50 border-primary-300 text-primary-700'
											: 'bg-white border-gray-200 text-gray-700 hover:border-primary-200'
									}`}
								>
									{category.name}
								</button>
							))}
						</div>
					</div>

					{/* 直近使用したジャンル */}
					{recentCategories.length > 0 && (
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<History className="w-6 h-6 text-primary" />
								<h3 className="text-sm font-medium">直近使用したジャンル</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{recentCategories.map((category) => (
									<button
										key={category.id}
										onClick={() => onCategorySelect(category.id, categoryIndex)}
										className={`px-3 py-2 rounded-full border text-sm transition-colors ${
											currentCategory === category.id
												? 'bg-primary-50 border-primary-300 text-primary-700'
												: 'bg-white border-gray-200 text-gray-700 hover:border-primary-200'
										}`}
									>
										{category.name}
									</button>
								))}
							</div>
						</div>
					)}

					{/* カテゴリーから探す */}
					<div className="space-y-3">
						<div className="flex items-center space-x-2">
							<SearchCheck className="w-6 h-6 text-primary" />
							<h3 className="text-sm font-medium">カテゴリーから探す</h3>
						</div>
						<div className="space-y-2">
							{genres.map((genre) => (
								<div key={genre.id} className="border-b border-gray-100 last:border-b-0">
									<button
										onClick={() => handleGenreToggle(genre.id)}
										className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50"
									>
										<div>
											<div className="font-medium text-primary-600">{genre.name}</div>
											<div className="text-xs text-gray-500">
												{getGenreDescription(genre.name)}
											</div>
										</div>
										<div className="text-gray-400">
											{expandedGenres.includes(genre.id) ? '▼' : '▶'}
										</div>
									</button>
									{expandedGenres.includes(genre.id) && (
										<div className="pb-3 grid grid-cols-2 gap-2">
											{categories.filter(cat => cat.genre_id === genre.id).map((category) => (
												<button
													key={category.id}
													onClick={() => onCategorySelect(category.id, categoryIndex)}
													className={`px-3 py-2 rounded-full border text-sm transition-colors ${
														currentCategory === category.id
															? 'bg-primary-50 border-primary-300 text-primary-700'
															: 'bg-white border-gray-200 text-gray-700 hover:border-primary-200'
													}`}
												>
													{category.name}
												</button>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
} 