import React from 'react';
import { Button } from '@/components/ui/button';

interface FilterTab {
  id: string;
  label: string;
  isActive: boolean;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  onTabClick: (tabId: string) => void;
  className?: string;
}

export default function FilterTabs({ tabs, onTabClick, className = '' }: FilterTabsProps) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={tab.isActive ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabClick(tab.id)}
          className={`${
            tab.isActive
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'text-gray-600 hover:text-primary border-gray-300'
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
