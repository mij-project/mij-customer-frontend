import React from 'react';
import { Label } from "@/components/ui/label";
import { Category, Genre } from '@/api/endpoints/categories';
import CategoryModal from '@/features/shareVideo/componets/CategoryModal';
import { SHARE_VIDEO_CONSTANTS } from '@/features/shareVideo/constans/constans';
import { CategorySectionProps } from '@/features/shareVideo/types';

export default function CategorySection({
	category1,
	category2,
	category3,
	showCategoryModal1,
	showCategoryModal2,
	showCategoryModal3,
	categories,
	genres,
	recommendedCategories,
	recentCategories,
	expandedGenres,
	onCategorySelect,
	onCategoryClear,
	onExpandedGenresChange,
	onModalOpenChange1,
	onModalOpenChange2,
	onModalOpenChange3,
}: CategorySectionProps) {
	return (
		<div className="bg-white border-b border-gray-200 space-y-2 pr-5 pl-5 pt-5 pb-5">
			<Label className="text-sm font-medium font-bold">
				<span className="text-primary mr-1">*</span>カテゴリー（必ず1つは指定してください）
			</Label>
			
			<div className="space-y-3">
				{/* カテゴリー1-3を動的に生成 */}
				{Array.from({ length: SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT }, (_, index) => {
					const categoryIndex = (index + 1) as 1 | 2 | 3;
					const categoryStates = [category1, category2, category3];
					const modalStates = [showCategoryModal1, showCategoryModal2, showCategoryModal3];
					const setModalStates = [onModalOpenChange1, onModalOpenChange2, onModalOpenChange3];
					const currentCategory = categoryStates[index];
					
					return (
						<div key={categoryIndex} className="space-y-2">
							<div className="relative">
								<CategoryModal
									categoryIndex={categoryIndex}
									isOpen={modalStates[index]}
									onOpenChange={setModalStates[index]}
									currentCategory={currentCategory}
									onCategorySelect={onCategorySelect}
									categories={categories}
									genres={genres}
									recommendedCategories={recommendedCategories}
									recentCategories={recentCategories}
									expandedGenres={expandedGenres}
									onExpandedGenresChange={onExpandedGenresChange}
								/>
								{currentCategory && (
									<button
										onClick={() => onCategoryClear(categoryIndex)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										title="選択解除"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
} 