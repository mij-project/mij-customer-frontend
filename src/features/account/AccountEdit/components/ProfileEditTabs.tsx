import React from 'react';
import { TabType } from '../types';

interface ProfileEditTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'basic', label: '基本情報' },
  { id: 'avatar', label: 'プロフ画像' },
  { id: 'cover', label: 'ヘッダ画像' },
];

export default function ProfileEditTabs({ activeTab, onTabChange }: ProfileEditTabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 px-6 py-3 text-sm font-medium transition-colors relative
            ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
