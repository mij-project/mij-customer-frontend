import React from 'react';
import { Button } from '@/components/ui/button';

export default function WithdrawalHeaderSection() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">売上金の出金申請</h2>
      <Button className="bg-primary hover:bg-primary text-white">
        出金申請
      </Button>
    </div>
  );
} 