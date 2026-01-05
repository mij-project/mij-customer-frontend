import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Menu, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common';
import { formatPrice } from '@/lib/utils';

import { PlanDetail } from '@/api/types/plan';
import { TimeSalePlanInfo } from '@/api/types/time_sale';

import TimeSaleCard from '@/components/common/TimeSaleCard';

import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import {
  createPlanTimeSale,
  getPlanDetail,
  getPlanTimeSalePlanInfo,
  deletePlanTimeSale,
} from '@/api/endpoints/plans';

// ✅ Dialog imports (shadcn)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const LIMIT = 20;
const MODAL_PARAM_KEY = 'ts_modal';
type TimeSaleFilterType = 'all' | 'past' | 'ongoing' | 'upcoming';

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

  const page = useMemo(() => clampInt(searchParams.get('page'), 1, 1, 9999), [searchParams]);

  const isModalOpen = useMemo(() => searchParams.get(MODAL_PARAM_KEY) === '1', [searchParams]);

  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [timeSalePlanInfos, setTimeSalePlanInfos] = useState<TimeSalePlanInfo[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [filter, setFilter] = useState<TimeSaleFilterType>('ongoing');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [error, setError] = useState<{ show: boolean; messages: string[] }>({
    show: false,
    messages: [],
  });

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTimeSaleId, setSelectedTimeSaleId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filterLabels: Record<TimeSaleFilterType, string> = {
    all: 'すべて',
    ongoing: '進行中',
    upcoming: '開始予定',
    past: '過去',
  };

  // クリックアウトサイドでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  // フィルタリング関数
  const getTimeSaleStatus = (timeSale: TimeSalePlanInfo) => {
    const now = new Date();
    const startDate = new Date(convertDatetimeToLocalTimezone(timeSale.start_date));
    const endDate = new Date(convertDatetimeToLocalTimezone(timeSale.end_date));

    if (timeSale.is_expired || endDate < now) return 'past';
    if (timeSale.is_active || (startDate <= now && endDate >= now)) return 'ongoing';
    if (startDate > now) return 'upcoming';
    return 'past';
  };

  // フィルター済みのタイムセール
  const filteredTimeSales = useMemo(() => {
    if (filter === 'all') return timeSalePlanInfos;
    return timeSalePlanInfos.filter((item) => getTimeSaleStatus(item) === filter);
  }, [timeSalePlanInfos, filter]);

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
      setError({
        show: true,
        messages: ['タイムセール一覧の取得に失敗しました。再度お試しください。'],
      });
      console.error('Failed to fetch time sale list:', e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!plan_id) return;
    fetchTimeSaleList(plan_id, page, LIMIT);
  }, [plan_id, page, fetchTimeSaleList]);

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
        setError({
          show: true,
          messages: ['既存のタイムセールが存在します。終了までお待ちください。'],
        });
      } else {
        setError({
          show: true,
          messages: ['タイムセールの作成に失敗しました。再度お試しください。'],
        });
      }
    }
  };

  // ✅ click "削除" -> open dialog (no delete yet)
  const deleteTimeSale = (timeSaleId: string) => {
    setSelectedTimeSaleId(timeSaleId);
    setShowDeleteDialog(true);
  };

  // ✅ confirm delete -> do real delete
  const handleConfirmDeleteTimeSale = async () => {
    if (!plan_id || !selectedTimeSaleId || actionLoading) return;

    try {
      setActionLoading(true);

      await deletePlanTimeSale(selectedTimeSaleId);

      toast('タイムセールを削除しました。', {
        icon: <Check className="w-4 h-4" color="#6DE0F7" />,
      });

      setShowDeleteDialog(false);
      setSelectedTimeSaleId(null);

      // list refresh（page維持）
      await fetchTimeSaleList(plan_id, page, LIMIT);
    } catch (e) {
      toast('削除に失敗しました。');
      console.error('Failed to delete time sale:', e);
    } finally {
      setActionLoading(false);
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
          {/* ✅ Delete confirm dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>タイムセールを削除しますか？</DialogTitle>
                <DialogDescription>
                  この操作は取り消せません。タイムセールを削除してもよろしいですか？
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={actionLoading}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleConfirmDeleteTimeSale}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading ? '処理中...' : '削除する'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {error.show && <ErrorMessage message={error.messages} />}

          {/* Plan Basic Information */}
          {plan && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-bold text-gray-900">プラン名：{plan.name}</p>
                <p className="text-sm font-bold text-gray-900">
                  プラン価格：¥ {formatPrice(plan.price || 0)}
                </p>
              </div>
            </div>
          )}

          {/* TimeSale Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">タイムセール一覧</p>

              {/* Filter Bar */}
              {timeSalePlanInfos.length > 0 && (
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm whitespace-nowrap rounded border transition-all ${filter !== 'all'
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className="whitespace-nowrap">{filterLabels[filter]}</span>
                    <Menu className="w-4 h-4" />
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                      {(['all', 'ongoing', 'upcoming', 'past'] as TimeSaleFilterType[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setFilter(f);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-sm text-left whitespace-nowrap transition-colors ${filter === f
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {filterLabels[f]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              {loadingList ? (
                <div className="p-4 text-sm text-gray-600" />
              ) : timeSalePlanInfos.length === 0 ? (
                <div className="p-4 text-sm text-gray-600 text-center">
                  タイムセールはまだありません。
                </div>
              ) : filteredTimeSales.length === 0 ? (
                <div className="p-4 text-sm text-gray-600 text-center">
                  このフィルターに該当するタイムセールはありません。
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTimeSales.map((item) => {
                    const isUpcoming = getTimeSaleStatus(item) === 'upcoming';
                    return (
                      <div key={item.id} className="relative">
                        <TimeSaleCard item={item} originalPrice={plan?.price || 0} />

                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTimeSale(item.id)}
                            className="flex items-center gap-2"
                            disabled={actionLoading}
                          >
                            <Trash className="w-4 h-4" />
                            削除
                          </Button>

                          {isUpcoming && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/plan/plan-timesale-setting/edit/${item.id}`, {
                                  state: { time_sale_id: item.id, plan_id: plan_id  },
                                })
                              }
                              className="flex items-center gap-2"
                              disabled={actionLoading}
                            >
                              <Edit className="w-4 h-4" />
                              編集
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
