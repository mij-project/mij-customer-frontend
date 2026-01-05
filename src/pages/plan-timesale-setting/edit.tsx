import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithPopover } from '@/components/common/DatePickerWithPopover';

import { formatPrice } from '@/lib/utils';
import { PlanDetail } from '@/api/types/plan';
import { TimeSalePlanInfo } from '@/api/types/time_sale';

import { getPlanTimeSaleEditByTimeSaleId } from '@/api/endpoints/plans';
import { log } from 'console';
import { updateTimeSale } from '@/api/endpoints/time_sale';

function toIntOrNull(v: string): number | null {
  const cleaned = v.replace(/[^\d]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function buildDateTime(date?: Date, hour?: string): Date | undefined {
  if (!date) return undefined;
  const h = hour != null ? Number(hour) : 0;
  if (!Number.isFinite(h)) return undefined;

  const d = new Date(date);
  d.setHours(h, 0, 0, 0);
  return d;
}

function parseDateTime(dateTimeString: string): { date: Date; hour: string } {
  const dt = new Date(dateTimeString);
  const hour = pad2(dt.getHours());
  return { date: dt, hour };
}

export default function PlanTimesaleSettingEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { time_sale_id } = useParams<{ time_sale_id: string }>();
  const state = location.state as { plan_id?: string } | null;
  const plan_id = state?.plan_id;

  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [timeSale, setTimeSale] = useState<TimeSalePlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Start
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startHour, setStartHour] = useState<string | undefined>(undefined);

  // End
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endHour, setEndHour] = useState<string | undefined>(undefined);

  const startDateTime = useMemo(() => buildDateTime(startDate, startHour), [startDate, startHour]);
  const endDateTime = useMemo(() => buildDateTime(endDate, endHour), [endDate, endHour]);

  const [useMaxCount, setUseMaxCount] = useState(false);
  const [maxCountRaw, setMaxCountRaw] = useState('');
  const maxCount = useMemo(() => toIntOrNull(maxCountRaw), [maxCountRaw]);

  const [percentRaw, setPercentRaw] = useState('');
  const percent = useMemo(() => toIntOrNull(percentRaw), [percentRaw]);

  const [formError, setFormError] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // タイムセールIDから初期データを取得
  useEffect(() => {
    if (!time_sale_id) return;

    const run = async () => {
      try {
        // タイムセールIDから プラン詳細とタイムセール情報を一度に取得
        const initData = await getPlanTimeSaleEditByTimeSaleId(time_sale_id);

        // プラン情報を設定
        if (initData.plan) {
          setPlan(initData.plan);
        }

        // タイムセール情報を設定
        if (initData.time_sale) {
          setTimeSale(initData.time_sale);

          // フォームに値を反映
          const { date: startDt, hour: startH } = parseDateTime(initData.time_sale.start_date);
          const { date: endDt, hour: endH } = parseDateTime(initData.time_sale.end_date);

          setStartDate(startDt);
          setStartHour(startH);
          setEndDate(endDt);
          setEndHour(endH);
          setPercentRaw(String(initData.time_sale.sale_percentage));

          if (initData.time_sale.max_purchase_count) {
            setUseMaxCount(true);
            setMaxCountRaw(String(initData.time_sale.max_purchase_count));
          }
        } else {
          setFormError(['タイムセール情報が見つかりません。']);
        }
      } catch (e) {
        setFormError(['プランまたはタイムセール情報の取得に失敗しました。再度お試しください。']);
        console.error('Failed to fetch plan or time sale:', e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [time_sale_id]);

  const validate = () => {
    const errors: string[] = [];
    if (percent == null) errors.push('セール率を入力してください。');
    if (percent && (percent <= 0 || percent >= 100))
      errors.push('セール率は1〜99の範囲で入力してください。');

    if (!startDate || startHour == null) errors.push('開始日時（日付・時）を選択してください。');
    if (!endDate || endHour == null) errors.push('終了日時（日付・時）を選択してください。');
    if (!startDateTime || !endDateTime) errors.push('開始・終了日時の形式が正しくありません。');
    if (startDateTime && endDateTime && startDateTime.getTime() >= endDateTime.getTime())
      errors.push('終了日時は開始日時より後にしてください。');

    if (useMaxCount) {
      if (maxCount == null) errors.push('最大購入数を入力してください。');
      if (maxCount && maxCount <= 0) errors.push('最大購入数は1以上にしてください。');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err.length > 0) {
      setFormError(err);
      return;
    }

    const request = {
      start_date: startDateTime,
      end_date: endDateTime,
      sale_percentage: percent!,
      max_purchase_count: useMaxCount ? maxCount : null,
    };
    try {
      setSubmitting(true);
      await updateTimeSale(time_sale_id, request);
      toast('タイムセールを更新しました。', {
        icon: <Check className="w-4 h-4" color="#6DE0F7" />,
      });

			navigate(`/plan/plan-timesale-setting/${plan_id}`);
    } catch (error) {
      console.error('Failed to update time sale:', error);
      if (error instanceof AxiosError && error.response?.status === 400) {
        setFormError(['既存のタイムセールの期間が重複しています。再度お試しください。']);
      }
      toast('タイムセールの更新に失敗しました。再度お試しください。');
    } finally {
      setSubmitting(false);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-10 flex justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center w-full justify-center">
            <p className="text-xl font-semibold text-center">タイムセール編集</p>
          </div>

          <div className="w-10" />
        </div>

        <div className="pt-6 space-y-6 p-4 pb-20">

          {/* Notice Section */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-gray-900">タイムセール機能の注意点</p>
              <a
                href="/time-sale-notice"
                rel="noreferrer"
                className="shrink-0 text-xs text-blue-600 underline underline-offset-2 hover:opacity-80"
              >
                詳細はこちら
              </a>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-md bg-white border border-gray-200 p-3">
                <p className="text-xs font-bold text-gray-900">更新時の価格について</p>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  タイムセール価格でプラン加入したユーザーは、次回以降の更新時も同じ価格が適用されます。
                  <br />
                  例：5,000円 → 4,000円で12月1日プラン加入 → 1月1日の更新も4,000円
                  <br />
                  ※タイムセール終了後も、更新価格はタイムセール価格となります。
                </p>
              </div>
            </div>
          </div>

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


          {/* Settings Section */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 space-y-4 p-5">
            {/* 割引率 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium font-bold">セール パーセント（%）</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="例：20"
                value={percentRaw}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') {
                    setPercentRaw('');
                    setFormError(null);
                    return;
                  }
                  setPercentRaw(v.replace(/[^\d]/g, ''));
                  setFormError(null);
                }}
              />
              <p className="text-xs text-gray-500">1〜99の範囲で入力してください。</p>

              {/* 割引後の金額表示 */}
              {plan && percent && (
                <div className="mt-4 p-3 rounded-md bg-white border border-blue-200">
                  <p className="text-xs text-gray-600">割引後の金額</p>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-xs text-gray-500 line-through">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ¥{(plan.price - Math.ceil(percent * plan.price * 0.01)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 開始・終了日時 */}
            <div className="space-y-4">
              {/* 開始日時 */}
              <div className="space-y-2">
                <Label className="text-sm">開始日時</Label>

                <div className="flex flex-row items-center gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <DatePickerWithPopover
                      modal={true}
                      value={startDate}
                      onChange={(d) => {
                        setStartDate(d);
                        setFormError(null);
                      }}
                      disabledBefore={true}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-auto">
                    <Select
                      value={startHour}
                      onValueChange={(value) => {
                        setStartHour(value);
                        setFormError(null);
                      }}
                    >
                      <SelectTrigger className="w-[100px] flex items-center justify-between">
                        <SelectValue placeholder="時" />
                        {startHour && <span className="text-sm font-medium font-bold ml-1">時</span>}
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={pad2(i)}>
                            {pad2(i)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 終了日時 */}
              <div className="space-y-2">
                <Label className="text-sm">終了日時</Label>

                <div className="flex flex-row items-center gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <DatePickerWithPopover
                      modal={true}
                      value={endDate}
                      onChange={(d) => {
                        setEndDate(d);
                        setFormError(null);
                      }}
                      disabledBefore={true}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-auto">
                    <Select
                      value={endHour}
                      onValueChange={(value) => {
                        setEndHour(value);
                        setFormError(null);
                      }}
                    >
                      <SelectTrigger className="w-[100px] flex items-center justify-between">
                        <SelectValue placeholder="時" />
                        {endHour && <span className="text-sm font-medium font-bold ml-1">時</span>}
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={pad2(i)}>
                            {pad2(i)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* 最大購入数 */}
            <ToggleRow
              label="購入制限人数"
              id="maxcount"
              checked={useMaxCount}
              onChangeToggle={(v) => {
                setUseMaxCount(v);
                setFormError(null);
                if (!v) setMaxCountRaw('');
              }}
            />

            {useMaxCount && (
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="例：100"
                  value={maxCountRaw}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      setMaxCountRaw('');
                      setFormError(null);
                      return;
                    }
                    setMaxCountRaw(v.replace(/[^\d]/g, ''));
                    setFormError(null);
                  }}
                />
                <p className="text-xs text-gray-500">整数のみ入力してください。</p>
              </div>
            )}

            {formError && formError.length > 0 && <ErrorMessage message={formError} variant="error" />}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white border-t border-gray-200 p-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            キャンセル
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={(formError && formError.length > 0) || submitting}
          >
            {submitting ? '更新中...' : '更新'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  id,
  checked,
  onChangeToggle,
  disabled = false,
}: {
  label: string;
  id: string;
  checked: boolean;
  onChangeToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm font-medium font-bold">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChangeToggle} disabled={disabled} />
    </div>
  );
}