import React from 'react';
import { Button } from '@/components/ui/button';
import { AccountNavigationProps } from '@/features/account/types';


export default function AccountNavigation({ items, onItemClick }: AccountNavigationProps) {
  return (
    <div className="border-b border-gray-200 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex min-w-max">
        {items.map((item) => (
           <Button
             key={item.id}
             variant="ghost"
             className={`flex-shrink-0 px-6 flex-row items-center justify-center rounded-none border-b-2 h-16 gap-2 ${
               item.isActive
                 ? 'border-primary text-primary bg-primary/5'
                 : 'border-transparent text-gray-600 hover:text-gray-900'
             }`}
             onClick={() => onItemClick(item.id)}
           >
             <span className="text-xs whitespace-nowrap">{item.label}</span>
             {item.count !== undefined && (
               <span className="text-sm font-medium">{item.count}</span>
             )}
           </Button>
        ))}
      </div>
    </div>
  );
}
