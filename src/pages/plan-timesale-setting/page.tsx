import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Tags } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common';
import { Textarea } from '@/components/ui/textarea';

import { formatPrice } from '@/lib/utils';
import { PlanDetail } from '@/api/types/plan';
import { TimeSalePlanInfo } from '@/api/types/time_sale';

import CreateTimeSaleModal from '@/components/common/CreateTimeSaleModal';
import TimeSaleCard from '@/components/common/TimeSaleCard';

import { createPlanTimeSale, getPlanDetail, getPlanTimeSalePlanInfo } from '@/api/endpoints/plans';

const LIMIT = 20;
const MODAL_PARAM_KEY = 'ts_modal';

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return Math.max(min, Math.min(max, i));
}

export default function PlanTimesaleSetting() {
  const navigate = useNavigate();
  const { plan_id } = useParams<{ plan_id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(
    () => clampInt(searchParams.get('page'), 1, 1, 9999),
    [searchParams]
  );

  const isModalOpen = useMemo(
    () => searchParams.get(MODAL_PARAM_KEY) === '1',
    [searchParams]
  );

  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [timeSalePlanInfos, setTimeSalePlanInfos] = useState<TimeSalePlanInfo[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<{ show: boolean; messages: string[] }>({
    show: false,
    messages: [],
  });
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // URL の page/limit を揃える（replaceで履歴を汚さない）
  useEffect(() => {
    const hasPage = Boolean(searchParams.get('page'));
    const hasLimit = Boolean(searchParams.get('limit'));
    const urlLimit = searchParams.get('limit');

    if (!hasPage || !hasLimit || urlLimit !== String(LIMIT)) {
      const sp = new URLSearchParams(searchParams);
      sp.set('page', String(hasPage ? page : 1));
      sp.set('limit', String(LIMIT));
      setSearchParams(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // query update（ts_modal を保持したまま page/limit だけ変える）
  const updateQuery = useCallback(
    (next: { page?: number }) => {
      const sp = new URLSearchParams(searchParams);
      sp.set('page', String(next.page ?? page));
      sp.set('limit', String(LIMIT));
      setSearchParams(sp);
    },
    [searchParams, page, setSearchParams]
  );

  // modal open/close（URL param で保持）
  const openModal = useCallback(() => {
    const sp = new URLSearchParams(searchParams);
    sp.set(MODAL_PARAM_KEY, '1');
    setSearchParams(sp);
  }, [searchParams, setSearchParams]);

  const closeModal = useCallback(() => {
    const sp = new URLSearchParams(searchParams);
    sp.delete(MODAL_PARAM_KEY);
    setSearchParams(sp);
  }, [searchParams, setSearchParams]);

  // Plan 取得
  useEffect(() => {
    if (!plan_id) return;

    const run = async () => {
      try {
        const res = await getPlanDetail(plan_id);
        if (res) setPlan(res);
      } catch (e) {
        setError({ show: true, messages: ['プランの取得に失敗しました。再度お試しください。'] });
        console.error('Failed to fetch plan:', e);
      }
    };

    run();
  }, [plan_id]);

  // List 取得
  const fetchTimeSaleList = useCallback(async (pid: string, p: number, l: number) => {
    try {
      setLoadingList(true);
      setError((prev) => ({ ...prev, show: false }));

      const response = await getPlanTimeSalePlanInfo(pid, p, l);
      const items: TimeSalePlanInfo[] = response.data.time_sales || [];
      const has_next: boolean = Boolean(response.data.has_next);

      setTimeSalePlanInfos(items);
      setHasNext(has_next);
    } catch (e) {
      setError({ show: true, messages: ['タイムセール一覧の取得に失敗しました。再度お試しください。'] });
      console.error('Failed to fetch time sale list:', e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!plan_id) return;
    fetchTimeSaleList(plan_id, page, LIMIT);
  }, [plan_id, page, fetchTimeSaleList]);

  // 入力内容に応じてテキストエリアの高さを自動調整
  useEffect(() => {
    if (descriptionTextareaRef.current) {
      descriptionTextareaRef.current.style.height = 'auto';
      descriptionTextareaRef.current.style.height = `${descriptionTextareaRef.current.scrollHeight}px`;
      descriptionTextareaRef.current.style.overflowY = descriptionTextareaRef.current.scrollHeight > descriptionTextareaRef.current.clientHeight ? 'auto' : 'hidden';
    }
  }, [plan?.description]);

  // Create
  const handleCreateTimeSale = async (payload: {
    percent: number;
    hasStartEnd: boolean;
    startDateTime?: Date;
    endDateTime?: Date;
    hasMaxPurchaseCount: boolean;
    maxPurchaseCount?: number;
  }) => {
    setError({ show: false, messages: [] });
    if (!plan_id) return;

    try {
      const request = {
        start_date: payload.hasStartEnd ? payload.startDateTime : null,
        end_date: payload.hasStartEnd ? payload.endDateTime : null,
        sale_percentage: payload.percent,
        max_purchase_count: payload.hasMaxPurchaseCount ? payload.maxPurchaseCount : null,
      };

      const response = await createPlanTimeSale(plan_id, request);

      if (response.status === 200) {
        toast('タイムセールを作成しました。', {
          icon: <Check className="w-4 h-4" color="#6DE0F7" />,
        });

        // modal close + page=1 を 1回の setSearchParams で
        const sp = new URLSearchParams(searchParams);
        sp.delete(MODAL_PARAM_KEY);
        sp.set('page', '1');
        sp.set('limit', String(LIMIT));
        setSearchParams(sp);

        await fetchTimeSaleList(plan_id, 1, LIMIT);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 400) {
        setError({ show: true, messages: ['既存のタイムセールが存在します。終了までお待ちください。'] });
      } else {
        setError({ show: true, messages: ['タイムセールの作成に失敗しました。再度お試しください。'] });
      }
      // エラー時は modal を閉じない（必要なら closeModal() を呼ぶ）
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10 max-w-xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/account/plan')}
            className="w-10 flex justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center w-full justify-center">
            <p className="text-xl font-semibold text-center">タイムセール設定</p>
          </div>

          <div className="w-10" />
        </div>

        <div className="pt-20 space-y-6 p-4">
          {error.show && <ErrorMessage message={error.messages} />}

          {/* Plan Basic Information */}
          {plan && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-bold text-gray-900">プラン名：{plan.name}</p>
                <p className="text-sm font-bold text-gray-900">
                  プラン価格：¥ {formatPrice(plan.price || 0)}
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-900">概要：</p>
                  <Textarea
                    ref={descriptionTextareaRef}
                    value={plan.description ?? ''}
                    readOnly
                    disabled
                    rows={5}
                    className="
                      bg-white
                      resize-none
                      border border-gray-200
                      shadow-none
                      focus:outline-none focus:ring-0
                      cursor-default
                      w-full
                    "
                  />
                </div>
              </div>
            </div>
          )}

          {/* TimeSale Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">タイムセール一覧</p>

              <Button onClick={openModal} size="sm" className="font-bold">
                <Tags className="h-4 w-4" />
                タイムセール作成
              </Button>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              {loadingList ? (
                <div className="p-4 text-sm text-gray-600" />
              ) : timeSalePlanInfos.length === 0 ? (
                <div className="p-4 text-sm text-gray-600 text-center">タイムセールはまだありません。</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {timeSalePlanInfos.map((item) => (
                    <TimeSaleCard
                      key={item.id}
                      item={item}
                      originalPrice={plan?.price || 0}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination（左右の位置固定） */}
            <div className="flex items-center justify-center gap-2 pt-2 w-full">
              <div className="w-24 flex justify-start">
                {page > 1 && (
                  <Button variant="outline" size="sm" onClick={() => updateQuery({ page: page - 1 })}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                )}
              </div>

              <div className="w-24 flex justify-end">
                {hasNext && (
                  <Button variant="outline" size="sm" onClick={() => updateQuery({ page: page + 1 })}>
                    <ChevronRight className="h-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTimeSaleModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleCreateTimeSale} originalPrice={plan?.price} />
    </div>
  );
}
