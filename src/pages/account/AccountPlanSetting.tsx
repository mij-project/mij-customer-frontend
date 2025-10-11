import React, { useState } from 'react';
import AccountHeader from '@/features/account/component/AccountHeader';

// セクションコンポーネントをインポート
import PlanHeaderSection from '@/features/account/AccountPlanSetting/PlanHeaderSection';
import EmptyPlanSection from '@/features/account/AccountPlanSetting/EmptyPlanSection';
import PlanListSection from '@/features/account/AccountPlanSetting/PlanListSection';
import PlanTipsSection from '@/features/account/AccountPlanSetting/PlanTipsSection';

interface Plan {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  subscriberCount: number;
  createdDate: string;
}

const mockPlans: Plan[] = [
  {
    id: '1',
    title: 'ベーシックプラン',
    description: '基本的なコンテンツにアクセスできるプランです',
    price: 1000,
    isActive: true,
    subscriberCount: 5,
    createdDate: '2025/07/01'
  },
  {
    id: '2',
    title: 'プレミアムプラン',
    description: 'すべてのコンテンツにアクセスできるプランです',
    price: 2000,
    isActive: false,
    subscriberCount: 0,
    createdDate: '2025/07/15'
  }
];

export default function AccountPlanSetting() {
  const [plans, setPlans] = useState<Plan[]>(mockPlans);

  const handleCreatePlan = () => {
    console.log('Create new plan');
  };

  const handleEditPlan = (planId: string) => {
    console.log('Edit plan:', planId);
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter(plan => plan.id !== planId));
  };

  const handleTogglePlan = (planId: string) => {
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, isActive: !plan.isActive }
        : plan
    ));
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">

      <AccountHeader title="プラン管理" showBackButton />
      
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <PlanHeaderSection onCreatePlan={handleCreatePlan} />

        {/* Content Section */}
        {plans.length === 0 ? (
          <EmptyPlanSection onCreatePlan={handleCreatePlan} />
        ) : (
          <PlanListSection 
            plans={plans}
            onTogglePlan={handleTogglePlan}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {/* Tips Section */}
        <PlanTipsSection />
      </div>
    </div>
  );
}
