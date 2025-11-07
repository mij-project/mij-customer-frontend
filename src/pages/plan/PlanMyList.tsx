import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlans } from '@/api/endpoints/plans';
import { Plan } from '@/api/types/plan';
import { MoreVertical, Edit, Users, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlanMyList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeTab, setActiveTab] = useState<'normal' | 'recommended'>('normal');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getPlans();
      setPlans(response.plans);
    } catch (err) {
      console.error('プラン一覧取得エラー:', err);
      setError('プラン一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const normalPlans = plans.filter((p) => p.type === 1);
  const recommendedPlans = plans.filter((p) => p.type === 2);
  const displayPlans = activeTab === 'normal' ? normalPlans : recommendedPlans;

  const handleMenuToggle = (planId: string) => {
    setOpenMenuId(openMenuId === planId ? null : planId);
  };

  if (loading) {
    return (
      <CommonLayout header={true}>
        <Header />
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <BottomNavigation />
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">プラン管理</h1>
              <Button onClick={() => navigate('/plan/reorder')} variant="outline" size="sm">
                プロフィールの並び順を変更
              </Button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('normal')}
                className={`px-4 py-2 font-medium ${activeTab === 'normal' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              >
                一般
              </button>
              <button
                onClick={() => setActiveTab('recommended')}
                className={`px-4 py-2 font-medium ${activeTab === 'recommended' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              >
                おすすめ
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4">
              <ErrorMessage message={error} variant="error" />
            </div>
          )}

          <div className="p-4 space-y-4">
            {displayPlans.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">プランがありません</p>
                <Button onClick={() => navigate('/plan/create')} className="mt-4">
                  プランを作成
                </Button>
              </div>
            ) : (
              displayPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg p-4 relative">
                  {plan.type === 2 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      おすすめ
                    </span>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleMenuToggle(plan.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {openMenuId === plan.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => navigate(`/plan/edit/${plan.id}`)}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          プランの編集
                        </button>
                        <button
                          onClick={() => navigate(`/plan/subscriber/${plan.id}`)}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          加入者一覧
                        </button>
                        <button
                          onClick={() => navigate(`/plan/${plan.id}`)}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          プランを確認
                        </button>
                        <button
                          onClick={() => navigate(`/plan/delete/${plan.id}`)}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          プランを削除
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="pt-8">
                    <div className="flex items-center mb-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold">
                        一般
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>投稿数: {plan.post_count || 0}件</span>
                      <span>月額料金: ¥{plan.price.toLocaleString()}/月</span>
                      <span>加入者数: {plan.subscriber_count || 0}人</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div
              className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors"
              onClick={() => navigate('/plan/create')}
            >
              <div className="flex items-center justify-center text-primary font-medium">
                <span className="text-2xl mr-2">+</span>プラン名
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                投稿数: 0件 月額料金: ¥0/月 加入者数: 0人
              </p>
            </div>

            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 underline">
                プランの作成例はこちら
              </a>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </CommonLayout>
  );
}
