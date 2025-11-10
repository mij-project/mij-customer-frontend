import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export default function CouponManagementSection() {
  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <Button variant="ghost" className="w-full justify-start text-left">
        <Gift className="h-5 w-5 mr-3" />
        クーポン管理
      </Button>
    </div>
  );
}
