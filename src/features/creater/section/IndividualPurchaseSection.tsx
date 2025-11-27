import { Clock } from 'lucide-react';
import { IndividualPurchase } from '@/features/creater/types';

export default function IndividualPurchaseSection({ items }: { items: IndividualPurchase[] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
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
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {item.duration}
              </div>
            )}
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              ¥{item.price.toLocaleString()}
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-500 mb-1">{item.date}</p>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
