import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlans } from '@/api/endpoints/plans';
import { Plan } from '@/api/types/plan';
import { MoreVertical, Edit, Users, Eye, Trash2, Coins, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlanMyList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
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

  const handleMenuToggle = (planId: string) => {
    setOpenMenuId(openMenuId === planId ? null : planId);
  };

  // おすすめプラン（type === 2）を上に表示するようにソート
  const sortedPlans = React.useMemo(() => {
    return [...plans].sort((a, b) => {
      // おすすめプラン（type === 2）を優先
      if (a.type === 2 && b.type !== 2) return -1;
      if (a.type !== 2 && b.type === 2) return 1;
      // 同じタイプの場合はdisplay_orderでソート（あれば）
      if (a.display_order !== null && b.display_order !== null) {
        return a.display_order - b.display_order;
      }
      return 0;
    });
  }, [plans]);

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
        <div className="max-w mx-auto">
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <p className="text-xl font-bold text-gray-900">プラン管理</p>
              </div>
              <Button onClick={() => navigate('/plan/reorder')} variant="outline" size="sm" className="text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                プロフィールの並び順を変更
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4">
              <ErrorMessage message={error} variant="error" />
            </div>
          )}

          <div className="p-4 space-y-4">
            {sortedPlans.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">プランがありません</p>
                <Button onClick={() => navigate('/plan/create')} className="mt-4">
                  プランを作成
                </Button>
              </div>
            ) : (
              sortedPlans.map((plan) => (
                <div key={plan.id} className="space-y-2">
                  <div className="bg-white rounded-lg p-4 relative">
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
                            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={plan.plan_status === 2}
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
                            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={plan.plan_status === 2}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            プランを削除
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0 mb-3">
                      <span className="bg-secondary text-gray text-xs px-2 py-1 rounded font-bold">
                        一般
                      </span>
                      {plan.type === 2 && (
                        <span
                          className="bg-primary text-white text-xs px-2 py-1 font-bold ml-1 relative"
                          style={{
                            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
                            paddingRight: '12px'
                          }}
                        >
                          おすすめ
                        </span>
                      )}
                      {
                        plan.plan_status === 2 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 font-bold ml-1 relative"
                            style={{
                              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
                              paddingRight: '12px'
                            }}
                          >
                            削除申請中
                          </span>
                        )
                      }
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{plan.name}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">投稿数</div>
                        <div className="text-sm font-medium text-gray-900">{plan.post_count || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">月額料金</div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">{plan.price.toLocaleString()}/月</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">加入者数</div>
                        <div className="text-sm font-medium text-gray-900">{plan.subscriber_count || 0}</div>
                      </div>
                    </div>
                  </div>
                  {/* 削除予定の警告バナー（将来的にdeleted_atフィールドが追加された場合に表示） */}
                  {/* {plan.deleted_at && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-800">
                        {new Date(plan.deleted_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}に完全削除されます。
                      </span>
                    </div>
                  )} */}
                </div>
              ))
            )}

            <div
              className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors"
              onClick={() => navigate('/plan/create')}
            >
              <div className="flex items-center text-primary font-medium mb-4">
                <span className="text-2xl mr-2">+</span>プラン名
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">投稿数</div>
                  <div className="text-sm font-medium text-gray-900">0</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">月額料金</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900">0/月</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">加入者数</div>
                  <div className="text-sm font-medium text-gray-900">0</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <BottomNavigation />
    </CommonLayout>
  );
}
