import React from 'react';
import { Button } from '@/components/ui/button';
import { TabNavigationSectionProps } from '@/features/account/Account/types';

export default function TabNavigationSection({ items, onItemClick }: TabNavigationSectionProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex space-x-1">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={item.isActive ? 'default' : 'ghost'}
            className="flex-1 flex-col h-16 items-center justify-center"
            onClick={() => onItemClick(item.id)}
          >
            <span className="text-xs">{item.label}</span>
            <span className="text-sm font-medium">{item.count}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
