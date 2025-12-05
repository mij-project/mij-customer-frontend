import React, { useState, useEffect } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { PlanInfo } from '@/api/types/account';
import { getAccountPlan } from '@/api/endpoints/account';
import SubscriptionPlanCard from '@/features/account/components/SubscriptionPlanCard';
import { useNavigate } from 'react-router-dom';
import { cancelSubscription } from '@/api/endpoints/subscription';
import CancelSubscriptionModal from '@/components/common/CancelSubscriptionModal';
export default function PlanList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanInfo>();
  const [loading, setLoading] = useState(true);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  useEffect(() => {
    const fetchAccountPlan = async () => {
      try {
        setLoading(true);
        const response = await getAccountPlan();
        setPlans(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountPlan();
  }, []);

  const handleUnsubscribe = async (planId: string) => {
    try {
      const response = await cancelSubscription(planId);
      console.log(response);
      if (response["result"]) {
        // モーダルにプランの解約メッセージを表示
        setIsCancelSubscriptionModalOpen(true);
        setNextPaymentDate(response["next_billing_date"]);

      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const subscribedPlans = plans?.subscribed_plan_details || [];

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white pb-20 pt-10">
      <AccountHeader
        title="加入中のプラン"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : subscribedPlans.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">加入中のプランはありません</div>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {subscribedPlans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.purchase_id}
                plan={plan}
                onUnsubscribe={handleUnsubscribe}
              />
            ))}
          </div>
        )}
      </div>
      <CancelSubscriptionModal
        isOpen={isCancelSubscriptionModalOpen}
        onClose={() => setIsCancelSubscriptionModalOpen(false)}
        nextPaymentDate={nextPaymentDate}
      />
    </div>
  );
}

