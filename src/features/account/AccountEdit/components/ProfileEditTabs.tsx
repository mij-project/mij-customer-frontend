import React from 'react';
import { TabType } from '../types';

interface ProfileEditTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setErrors: (errors: {show: boolean, messages: string[]}) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'basic', label: '基本情報' },
  { id: 'avatar', label: 'プロフ画像' },
  { id: 'cover', label: 'ヘッダ画像' },
];

export default function ProfileEditTabs({ activeTab, setActiveTab, setErrors }: ProfileEditTabsProps) {
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setErrors({show: false, messages: []});
  };
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id as TabType)}
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
