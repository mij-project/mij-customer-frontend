import React, { useState, useEffect } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { PlanInfo } from '@/api/types/account';
import { AccountInfo } from '@/features/account/types';
import { getAccountPlan } from '@/api/endpoints/account';
import JoinedPlansSection from '@/features/account/social/JoinedPlansSection';
import { useNavigate } from 'react-router-dom';

export default function PlanList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanInfo>();
  useEffect(() => {
    const fetchAccountPlan = async () => {
      try {
        const response = await getAccountPlan();
        setPlans(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAccountPlan();
  }, []);

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="プラン管理"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="p-6 space-y-6">
        {/* ユーザーが加入しているプランを表示する */}
        <JoinedPlansSection accountInfo={plans ? ({ plan_info: plans } as AccountInfo) : null} />
      </div>
    </div>
  );
}
