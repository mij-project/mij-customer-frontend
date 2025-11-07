import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGenresWithCategories, GenreWithCategories } from '@/api/endpoints/categories';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { ArrowLeft } from 'lucide-react';

export default function CategoryList() {
	const [genresWithCategories, setGenresWithCategories] = useState<GenreWithCategories[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchGenresWithCategories = async () => {
			try {
				const data = await getGenresWithCategories();
				setGenresWithCategories(data);
			} catch (error) {
				console.error('Failed to fetch genres with categories:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchGenresWithCategories();
	}, []);

	const handleCategoryClick = (slug: string) => {
		navigate(`/category?slug=${slug}`);
	};

	const handleBack = () => {
		navigate(-1);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<p className="text-gray-500">読み込み中...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white pb-20">
			{/* カスタムヘッダー */}
			<div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
				<div className="max-w-screen-md mx-auto flex items-center justify-center h-14 px-4 relative">
					<button
						onClick={handleBack}
						className="absolute left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
						aria-label="戻る"
					>
						<ArrowLeft className="w-5 h-5 text-gray-700" />
					</button>
					<h1 className="text-base font-semibold text-gray-900">カテゴリーから探す</h1>
				</div>
			</div>

			{/* コンテンツ */}
			<div className="pt-14 px-4 max-w-screen-md mx-auto">
				{genresWithCategories.map((genre) => (
					<div key={genre.id} className="mb-8 mt-6">
						<h2 className="text-lg font-bold text-gray-900 mb-4">{genre.name}</h2>
						<div className="flex flex-wrap gap-2">
							{genre.categories.map((category) => (
								<button
									key={category.id}
									onClick={() => handleCategoryClick(category.slug)}
									className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full text-sm font-medium transition-all duration-200 border border-primary/20 hover:border-primary"
								>
									{category.name}
								</button>
							))}
						</div>
					</div>
				))}
			</div>

			<BottomNavigation />
		</div>
	);
}
