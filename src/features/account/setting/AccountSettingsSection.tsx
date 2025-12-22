import React from 'react';
import { Settings, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { UserRole } from '@/utils/userRole';

export default function AccountSettingsSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCreator = user?.role === UserRole.CREATOR ? true : false;

  return (
    <> 
      <div className="px-6 mb-6" onClick={() => navigate('/account/settings')}>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-600" />
            <span className="text-gray-900">アカウント設定</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {!isCreator && (
        <div className="px-6 mb-6" onClick={() => navigate('/creator/request')}>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">クリエイター登録</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}
    </>
  );
}
