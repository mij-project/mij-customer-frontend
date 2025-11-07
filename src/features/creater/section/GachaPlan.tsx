import { Star, Crown } from 'lucide-react';
import { GachaItem } from '@/features/creater/types';

export default function GachaPlan({ items }: { items: GachaItem[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex overflow-x-auto space-x-4 scrollbar-hide pb-2">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-80">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex">
                <div className="relative w-24 h-16">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <Star className="absolute top-1 right-1 h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary font-bold text-sm">
                      <Crown className="h-3 w-3 mr-1" />¥{item.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      残り {item.remaining} /{item.total}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
