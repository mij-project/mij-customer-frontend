import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlanDetail, requestPlanDeletion } from '@/api/endpoints/plans';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function PlanDelete() {
  const navigate = useNavigate();
  const { plan_id } = useParams<{ plan_id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [agreement1, setAgreement1] = useState(false);
  const [agreement2, setAgreement2] = useState(false);

  useEffect(() => {
    if (!plan_id) {
      setError('プランIDが指定されていません');
      setInitialLoading(false);
      return;
    }

    const fetchPlanDetail = async () => {
      try {
        const planData = await getPlanDetail(plan_id);
        setPlanName(planData.name);
        setPlanPrice(planData.price);
        setPostCount(planData.post_count || 0);
        setSubscriberCount(planData.subscriptions_count || 0);
      } catch (err) {
        console.error('プラン詳細取得エラー:', err);
        setError('プラン詳細の取得に失敗しました');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPlanDetail();
  }, [plan_id]);

  const handleCancel = () => {
    navigate('/account/plan');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreement1 || !agreement2) {
      setError('すべての項目に同意する必要があります');
      return;
    }

    if (!plan_id) return;

    setLoading(true);
    setError(null);

    try {
      await requestPlanDeletion(plan_id);
      navigate('/account/plan');
    } catch (err: any) {
      console.error('プラン削除申請エラー:', err);
      setError(err.response?.data?.detail || 'プランの削除申請に失敗しました');
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
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">プラン削除</h1>

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} variant="error" />
            </div>
          )}

          {/* プラン概要 */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{planName}</h2>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>投稿数: {postCount}件</span>
              <span>月額料金: ¥{planPrice.toLocaleString()}/月</span>
              <span>加入者数: {subscriberCount}人</span>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <p className="text-sm text-gray-700 mb-4">
              下記の内容をしっかりと読み、同意した上で削除手続きを行なってください。
            </p>

            {/* 赤い警告ボックス - 加入者がいる場合 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                プラン加入者がいる場合、削除手続きをした翌月末日にプランが削除されます
              </p>
            </div>

            {/* 青い情報ボックス - 加入者がいない場合 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">プラン加入者がいない場合は即時削除されます</p>
            </div>

            {/* 赤い警告 - 投稿の公開状態について */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                プラン削除後、このプランにしか紐付けされていない過去の投稿は自動的に公開されなくなります
              </p>
            </div>
          </div>

          {/* 同意チェックボックス */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-md font-bold text-gray-900 mb-4">同意事項</h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreement1"
                  checked={agreement1}
                  onCheckedChange={(checked) => setAgreement1(checked === true)}
                />
                <div>
                  <Label htmlFor="agreement1" className="text-sm text-gray-700 cursor-pointer">
                    プラン削除に関する注意事項を理解しました
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreement2"
                  checked={agreement2}
                  onCheckedChange={(checked) => setAgreement2(checked === true)}
                />
                <div>
                  <Label htmlFor="agreement2" className="text-sm text-gray-700 cursor-pointer">
                    プラン削除後の投稿の公開状態変更について理解しました
                  </Label>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex items-center space-x-4 mt-6">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={loading || !agreement1 || !agreement2}
                className="flex-1 bg-gray-300 text-gray-600 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'プラン削除を申請する'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CommonLayout>
  );
}
