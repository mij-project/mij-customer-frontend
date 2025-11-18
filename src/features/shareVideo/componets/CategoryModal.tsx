import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Category, Genre } from '@/api/endpoints/categories';
import { History, X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  onCategoryRemove: (categoryId: string) => void;
  categories: Category[];
  genres: Genre[];
  recommendedCategories: Category[];
  recentCategories: Category[];
  expandedGenres: string[];
  onExpandedGenresChange: (expandedGenres: string[]) => void;
}

export default function CategoryModal({
  isOpen,
  onOpenChange,
  selectedCategories,
  onCategorySelect,
  onCategoryRemove,
  categories,
  genres,
  recommendedCategories,
  recentCategories,
  expandedGenres,
  onExpandedGenresChange,
}: CategoryModalProps) {
  const placeholder = 'カテゴリーを選択してください（最大5つまで）';
  const title = 'カテゴリー選択';

  const handleGenreToggle = (genreId: string) => {
    if (expandedGenres.includes(genreId)) {
      onExpandedGenresChange(expandedGenres.filter((id) => id !== genreId));
    } else {
      onExpandedGenresChange([...expandedGenres, genreId]);
    }
  };

  const getSelectedCategories = () => {
    return selectedCategories
      .map((id) => categories.find((cat) => cat.id === id))
      .filter((cat): cat is Category => cat !== undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-primary focus-within:border-primary focus-within:border-2">
          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {getSelectedCategories().map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
                >
                  {category.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryRemove(category.id);
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogTitle className="text-lg font-medium text-center">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {placeholder}
          。直近使用したジャンル、またはカテゴリーから探すことができます。
        </DialogDescription>
        <div className="space-y-6 px-4">
          {/* 直近使用したジャンル */}
          {recentCategories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium">直近使用したジャンル</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedCategories.includes(category.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white hover:border-primary'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ジャンル別カテゴリー */}
          <div className="space-y-4">
            {genres.map((genre) => (
              <div key={genre.id} className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{genre.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((cat) => cat.genre_id === genre.id)
                    .map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                          selectedCategories.includes(category.id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white hover:border-primary'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
