import { Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GachaItem } from '@/features/creater/types';

export default function GachaSection({ items }: { items: GachaItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="relative">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute top-2 right-2">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-primary font-bold">
                <Crown className="h-4 w-4 mr-1" />¥{item.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                残り {item.remaining} /{item.total}
              </div>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={item.remaining === 0}
            >
              {item.remaining === 0 ? '売り切れ' : 'ガチャを回す'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
