import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';

export default function CouponManagementSection() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">クーポン管理</h3>
            <p className="text-sm text-gray-600">
              保有クーポンの確認、クーポンの発行、管理、
              <br />
              利用状況を確認できます。
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
