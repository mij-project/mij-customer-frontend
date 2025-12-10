import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlanDetail, getPlanSubscribers } from '@/api/endpoints/plans';
import { PlanSubscriber } from '@/api/types/plan';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';

export default function PlanSubscriberList() {
  const navigate = useNavigate();
  const { plan_id } = useParams<{ plan_id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planName, setPlanName] = useState('');
  const [subscribers, setSubscribers] = useState<PlanSubscriber[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plan_id) {
      setError('プランIDが指定されていません');
      setInitialLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [planData, subscribersData] = await Promise.all([
          getPlanDetail(plan_id),
          getPlanSubscribers(plan_id, 1, 20),
        ]);
        setPlanName(planData.name);
        setSubscribers(subscribersData.subscribers);
        setHasNext(subscribersData.has_next);
        setTotal(subscribersData.total);
        setPage(1);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [plan_id]);

  const loadMoreSubscribers = useCallback(async () => {
    if (!plan_id || loading || !hasNext) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const subscribersData = await getPlanSubscribers(plan_id, nextPage, 20);

      setSubscribers((prev) => [...prev, ...subscribersData.subscribers]);
      setHasNext(subscribersData.has_next);
      setPage(nextPage);
    } catch (err) {
      console.error('追加データ取得エラー:', err);
      setError('追加データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [plan_id, page, hasNext, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          loadMoreSubscribers();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNext, loading, loadMoreSubscribers]);

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('ja-JP', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //   });
  // };

  const calculateDuration = (subscribedAt: string) => {
    const start = new Date(subscribedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays}日`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}ヶ月`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}年`;
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
        <div className="max-w mx-auto">
          {/* ヘッダー */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">{planName}</h1>
            </div>
            <div className="flex items-center">
              <Button onClick={() => {console.log('click')}} variant="ghost" size="sm" className="text-gray-600" disabled={true}>
                <p className="h-4 w-4"></p>
              </Button>
              <p className="text-sm text-gray-600 mt-1">加入者一覧 ({total}人)</p>
            </div>
          </div>

          {error && (
            <div className="p-4">
              <ErrorMessage message={error} variant="error" />
            </div>
          )}

          {/* 加入者リスト */}
          <div className="divide-y divide-gray-200">
            {subscribers.length === 0 ? (
              <div className="bg-white p-12 text-center">
                <p className="text-gray-500">加入者がいません</p>
              </div>
            ) : (
              <>
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.user_id}
                    className="bg-white p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/profile?username=${subscriber.username}`)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* アバター */}
                      <div className="flex-shrink-0">
                        {subscriber.avatar_url ? (
                          <img
                            src={subscriber.avatar_url}
                            alt={subscriber.profile_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-lg font-bold">
                              {subscriber.profile_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ユーザー情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {subscriber.profile_name}
                          </p>
                          <p className="text-xs text-gray-500">@{subscriber.username}</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>加入日: {convertDatetimeToLocalTimezone(subscriber.subscribed_at, { year: 'numeric', month: '2-digit', day: '2-digit' }).split(' ')[0]}</span>
                          <span>期間: {calculateDuration(convertDatetimeToLocalTimezone(subscriber.subscribed_at))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Intersection Observer ターゲット */}
                {hasNext && (
                  <div
                    ref={observerTarget}
                    className="bg-white p-4 flex items-center justify-center"
                  >
                    {loading && <LoadingSpinner size="sm" />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CommonLayout>
  );
}
