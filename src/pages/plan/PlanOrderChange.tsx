import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlans, reorderPlans } from '@/api/endpoints/plans';
import { Plan } from '@/api/types/plan';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlanOrderChange() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [originalPlans, setOriginalPlans] = useState<Plan[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getPlans();
      // Backend already returns plans sorted by display_order (nulls last)
      const sortedPlans = response.plans;
      setPlans(sortedPlans);
      setOriginalPlans(sortedPlans);
    } catch (err) {
      console.error('プラン一覧取得エラー:', err);
      setError('プラン一覧の取得に失敗しました');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newPlans = [...plans];
    const draggedPlan = newPlans[draggedIndex];

    // Remove from old position
    newPlans.splice(draggedIndex, 1);

    // Insert at new position
    newPlans.splice(index, 0, draggedPlan);

    setPlans(newPlans);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newPlans = [...plans];
    [newPlans[index - 1], newPlans[index]] = [newPlans[index], newPlans[index - 1]];
    setPlans(newPlans);
  };

  const handleMoveDown = (index: number) => {
    if (index === plans.length - 1) return;
    const newPlans = [...plans];
    [newPlans[index], newPlans[index + 1]] = [newPlans[index + 1], newPlans[index]];
    setPlans(newPlans);
  };

  const handleResetToDefault = () => {
    setPlans([...originalPlans]);
  };

  const handleCancel = () => {
    navigate('/account/plan');
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const planOrders = plans.map((plan, index) => {
        return {
          plan_id: plan.id,
          display_order: index + 1,
        };
      });

      console.log('planOrders', planOrders);

      await reorderPlans({ plan_orders: planOrders });
      navigate('/account/plan');
    } catch (err: any) {
      console.error('並び順保存エラー:', err);
      console.error('エラー詳細:', err.response?.data);

      // エラーメッセージを文字列に変換
      let errorMessage = '並び順の保存に失敗しました';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          // FastAPIのバリデーションエラーの場合
          errorMessage = err.response.data.detail
            .map((e: any) => `${e.loc?.join('.')}: ${e.msg}`)
            .join(', ');
        } else {
          errorMessage = JSON.stringify(err.response.data.detail);
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
          {/* ヘッダー */}
          <div className="bg-white p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-2">プラン管理</h1>
            <p className="text-sm text-gray-600 mb-4">
              プロフィールに表示される順番を変更できます。上下ボタンをクリックするか、ドラッグして並び替えてください。
            </p>

            {/* アクションボタン */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                {loading ? <LoadingSpinner size="sm" /> : '変更完了'}
              </Button>
              <Button
                onClick={handleResetToDefault}
                disabled={loading}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                デフォルトに戻す
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4">
              <ErrorMessage message={error} variant="error" />
            </div>
          )}

          {/* プランリスト */}
          <div className="p-4 space-y-4">
            {plans.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">プランがありません</p>
              </div>
            ) : (
              plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg p-4 relative transition-all ${
                    draggedIndex === index ? 'opacity-50 shadow-lg scale-105' : 'shadow-sm'
                  } hover:shadow-md`}
                >
                  {/* 順番番号 */}
                  <div className="absolute left-2 top-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* ドラッグハンドルと上下ボタン */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={`p-1 rounded-full ${
                        index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title="上に移動"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <div
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className="cursor-move p-1 text-gray-400 hover:text-gray-600"
                      title="ドラッグして移動"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === plans.length - 1}
                      className={`p-1 rounded-full ${
                        index === plans.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title="下に移動"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="pl-12 pr-12">
                    {/* バッジ */}
                    <div className="flex items-center mb-2 space-x-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold">
                        一般
                      </span>
                      {plan.type === 2 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          おすすめ
                        </span>
                      )}
                    </div>

                    {/* プラン名 */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>

                    {/* 統計情報 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>投稿数: {plan.post_count || 0}件</span>
                      <span>月額料金: ¥{plan.price.toLocaleString()}/月</span>
                      <span>加入者数: {plan.subscriber_count || 0}人</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </CommonLayout>
  );
}
