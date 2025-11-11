import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountSettingsSection() {
  const navigate = useNavigate();

  return (
    <div className="px-6 mb-6" onClick={() => navigate('/account/settings')}>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
        <div className="flex items-center space-x-3">
          <Settings className="h-5 w-5 text-gray-600" />
          <span className="text-gray-900">アカウント設定</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
