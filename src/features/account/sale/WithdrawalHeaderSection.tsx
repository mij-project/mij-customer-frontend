import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function WithdrawalHeaderSection() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-900">売上金の出金申請</p>
      <Button className="bg-primary hover:bg-primary text-white" onClick={() => navigate('/account/sale-withdraw')}>出金申請</Button>
    </div>
  );
}
