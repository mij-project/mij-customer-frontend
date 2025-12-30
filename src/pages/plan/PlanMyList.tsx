import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
// import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlans } from '@/api/endpoints/plans';
import { Plan } from '@/api/types/plan';
import { MoreVertical, Edit, Users, Eye, Trash2, ArrowLeft , CalendarCheck, Sparkles} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlanMyList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (!openMenuId) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = menuRefs.current[openMenuId];
      if (!el) return;

      const target = e.target as Node;
      if (!el.contains(target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true } as any);
    };
  }, [openMenuId]);

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

  // 削除申請した翌月末の日付を計算
  const getDeletionDate = (updatedAt: string): string => {
    const date = new Date(updatedAt);
    // 翌月の最初の日を取得
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    // 翌月の最終日を取得（次の月の0日目 = 前月の最終日）
    const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    return lastDayOfNextMonth.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
      <CommonLayout header={false}>
        {/* <Header /> */}
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          {/* <LoadingSpinner size="lg" /> */}
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
                <Button
                  onClick={() => navigate('/account')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <p className="text-xl font-bold text-gray-900">プラン管理</p>
              </div>
              {/* <Button onClick={() => navigate('/plan/reorder')} variant="outline" size="sm" className="text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                プロフィールの並び順を変更
              </Button> */}
            </div>
          </div>

          {error && (
            <div className="p-4">
              <ErrorMessage message={error} variant="error" />
            </div>
          )}

          <div className="p-4 space-y-4">
            <div className="flex items-end justify-end">
              <Button
                onClick={() => navigate('/plan/reorder')}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                プロフィールの並び順を変更
              </Button>
            </div>
            {sortedPlans.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">プランがありません</p>
                <Button onClick={() => navigate('/plan/create')} className="mt-4">
                  プランを作成
                </Button>
              </div>
            ) : (
              sortedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* ヘッダー領域 - ステータスとタイトル */}
                  <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {plan.type === 2 && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold shadow">
                              <Sparkles className="h-3 w-3" />
                              おすすめ
                            </div>
                          )}
                          {plan.plan_status === 2 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              {getDeletionDate(plan.updated_at)}削除予定
                            </span>
                          )}
                          {plan.plan_status === 1 && plan.price === 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              無料プラン
                            </span>
                          )}
                          {plan.is_time_sale && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                              セール中{plan.sale_percentage ? `(${plan.sale_percentage}%)` : ''}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 truncate">{plan.name}</h3>
                      </div>
                      <div
                        ref={(el) => {
                          menuRefs.current[plan.id] = el;
                        }}
                        className="relative flex-shrink-0"
                      >
                        <button
                          onClick={() => handleMenuToggle(plan.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {openMenuId === plan.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                            <button
                              onClick={() => navigate(`/plan/edit/${plan.id}`)}
                              className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              disabled={plan.plan_status === 2}
                            >
                              <Edit className="w-4 h-4 mr-3 text-gray-500" />
                              プランの編集
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={() => navigate(`/plan/subscriber/${plan.id}`)}
                              className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 text-sm"
                            >
                              <Users className="w-4 h-4 mr-3 text-gray-500" />
                              加入者一覧を確認
                            </button>
                            <button
                              onClick={() => navigate(`/plan/${plan.id}`)}
                              className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 text-sm"
                            >
                              <Eye className="w-4 h-4 mr-3 text-gray-500" />
                              プランを確認
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={() => navigate(`/plan/delete/${plan.id}`)}
                              className="flex items-center w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              disabled={plan.plan_status === 2}
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              プランを削除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* メイン情報領域 */}
                  <div className="p-4">
                    {/* 3列情報表示 */}
                    <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">{plan.post_count || 0}</div>
                        <div className="text-xs text-gray-500 mt-1">投稿数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">
                          ¥{plan.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">月額料金</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">
                          {plan.subscriber_count || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">加入者数</div>
                      </div>
                    </div>

                    {/* タイムセール関連ボタン */}
                    {plan.plan_status === 1 && plan.price > 0 && (
                      <>
                        <div className="border-gray-100 pt-1 mt-1">
                          <div className="mb-3">
                            <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
                              <CalendarCheck className="h-5 w-5" />
                              タイムセール設定
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">
                            期間限定でこのプランを割引販売できます
                          </p>

                          {/* アクションボタン */}
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(`/plan/plan-timesale-setting/create/${plan.id}`)
                              }
                              disabled={plan.plan_status !== 1}
                              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
                            >
                              作成
                            </button>
                            <button
                              onClick={() => navigate(`/plan/plan-timesale-setting/${plan.id}`)}
                              className="flex-1 bg-secondary hover:bg-secondary/90 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors text-sm"
                            >
                              一覧
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
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
