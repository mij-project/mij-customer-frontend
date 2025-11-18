import React from 'react';
import { Label } from '@/components/ui/label';
import { Category, Genre } from '@/api/endpoints/categories';
import CategoryModal from '@/features/shareVideo/componets/CategoryModal';

interface CategorySectionProps {
  selectedCategories: string[];
  showCategoryModal: boolean;
  categories: Category[];
  genres: Genre[];
  recommendedCategories: Category[];
  recentCategories: Category[];
  expandedGenres: string[];
  onCategorySelect: (categoryId: string) => void;
  onCategoryRemove: (categoryId: string) => void;
  onExpandedGenresChange: (expandedGenres: string[]) => void;
  onModalOpenChange: (open: boolean) => void;
}

export default function CategorySection({
  selectedCategories,
  showCategoryModal,
  categories,
  genres,
  recommendedCategories,
  recentCategories,
  expandedGenres,
  onCategorySelect,
  onCategoryRemove,
  onExpandedGenresChange,
  onModalOpenChange,
}: CategorySectionProps) {
  return (
    <div className="bg-white border-b border-gray-200 space-y-2 pr-5 pl-5 pt-5 pb-5">
      <Label className="text-sm font-medium font-bold">
        <span className="text-primary mr-1">*</span>カテゴリー（必ず1つは指定してください）最大5つまで
      </Label>

      <div className="space-y-3">
        <CategoryModal
          isOpen={showCategoryModal}
          onOpenChange={onModalOpenChange}
          selectedCategories={selectedCategories}
          onCategorySelect={onCategorySelect}
          onCategoryRemove={onCategoryRemove}
          categories={categories}
          genres={genres}
          recommendedCategories={recommendedCategories}
          recentCategories={recentCategories}
          expandedGenres={expandedGenres}
          onExpandedGenresChange={onExpandedGenresChange}
        />
      </div>
    </div>
  );
}
