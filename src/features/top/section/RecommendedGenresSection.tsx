import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecommendedGenresSectionProps } from '@/features/top/types';
import { useNavigate } from 'react-router-dom';

export default function RecommendedGenresSection({ categories }: RecommendedGenresSectionProps) {
  const navigate = useNavigate();

  const handleGenreClick = (slug: string) => {
    navigate(`/category?slug=${slug}`);
  };

  return (
    <section className="bg-white py-6">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">おすすめジャンル</h2>
          {/* <Button variant="ghost" size="sm" className="text-primary hover:text-pink-600">
            もっと見る
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button> */}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors" 
              onClick={() => handleGenreClick(category.slug)}
            >
              <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.post_count.toLocaleString()} 件</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 