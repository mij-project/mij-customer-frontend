import React, { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import ErrorMessage from '@/components/common/ErrorMessage';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        percent: number;
        hasStartEnd: boolean;
        startDateTime?: Date;
        endDateTime?: Date;
        hasMaxPurchaseCount: boolean;
        maxPurchaseCount?: number;
    }) => void;
};

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

function buildDateTime(date?: Date, hour?: string, minute?: string): Date | undefined {
    if (!date) return undefined;
    const h = hour != null ? Number(hour) : 0;
    const m = minute != null ? Number(minute) : 0;
    if (!Number.isFinite(h) || !Number.isFinite(m)) return undefined;

    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
}

export default function CreateTimeSaleModal({ isOpen, onClose, onSubmit }: Props) {
    const useStartEnd = true;

    // Start
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [startHour, setStartHour] = useState<string | undefined>(undefined);
    const [startMinute, setStartMinute] = useState<string | undefined>(undefined);

    // End
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [endHour, setEndHour] = useState<string | undefined>(undefined);
    const [endMinute, setEndMinute] = useState<string | undefined>(undefined);

    const startDateTime = useMemo(
        () => buildDateTime(startDate, startHour, startMinute),
        [startDate, startHour, startMinute]
    );
    const endDateTime = useMemo(
        () => buildDateTime(endDate, endHour, endMinute),
        [endDate, endHour, endMinute]
    );

    const [useMaxCount, setUseMaxCount] = useState(true);
    const [maxCountRaw, setMaxCountRaw] = useState('');
    const maxCount = useMemo(() => toIntOrNull(maxCountRaw), [maxCountRaw]);

    const [percentRaw, setPercentRaw] = useState('');
    const percent = useMemo(() => toIntOrNull(percentRaw), [percentRaw]);

    const [formError, setFormError] = useState<string[] | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        setStartDate(undefined);
        setStartHour(undefined);
        setStartMinute(undefined);
        setEndDate(undefined);
        setEndHour(undefined);
        setEndMinute(undefined);

        setUseMaxCount(false);
        setMaxCountRaw('');

        setPercentRaw('');
        setFormError(null);
    }, [isOpen]);

    const validate = () => {
        const errors: string[] = [];
        if (percent == null) errors.push('セール率を入力してください。');
        if (percent <= 0 || percent >= 100) errors.push('セール率は1〜99の範囲で入力してください。');
        if (!useStartEnd) {
            errors.push('開始・終了日時を選択してください。');
        }
        if (useStartEnd) {
            if (!startDate || startHour == null || startMinute == null)
                errors.push('開始日時（日付・時・分）を選択してください。');
            if (!endDate || endHour == null || endMinute == null)
                errors.push('終了日時（日付・時・分）を選択してください。');
            if (!startDateTime || !endDateTime) errors.push('開始・終了日時の形式が正しくありません。');
            if (startDateTime.getTime() >= endDateTime.getTime())
                errors.push('終了日時は開始日時より後にしてください。');
            if (startDateTime < new Date())
                errors.push('開始日時は現在より前にしてください。');
            if (endDateTime < new Date())
                errors.push('終了日時は現在より前にしてください。');
        }

        if (useMaxCount) {
            if (maxCount == null) errors.push('最大購入数を入力してください。');
            if (maxCount <= 0) errors.push('最大購入数は1以上にしてください。');
        }

        if (!useStartEnd && !useMaxCount) {
            errors.push('期間、購入制限人数のどれかを設定してください。');
        }

        return errors;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err.length > 0) {
            setFormError(err);
            return;
        }

        await onSubmit({
            percent: percent!,
            hasStartEnd: useStartEnd,
            startDateTime: useStartEnd ? startDateTime : undefined,
            endDateTime: useStartEnd ? endDateTime : undefined,
            hasMaxPurchaseCount: useMaxCount,
            maxPurchaseCount: useMaxCount ? maxCount! : undefined,
        });

    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogOverlay className="z-[100] bg-black/30" />

            <DialogContent
                className="
                    z-[101]
                    w-[calc(100vw-24px)]
                    max-w-xl
                    max-h-[calc(100vh-24px)]
                    overflow-y-auto
                    rounded-lg
                    [&>button]:hidden
                    "
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-center">タイムセール作成</DialogTitle>
                    <DialogDescription className="text-center">
                        セール率、期間、購入制限人数を設定できます。
                    </DialogDescription>
                </DialogHeader>

                {/* Body (SettingsSection style) */}
                <div className="bg-white border-b border-gray-200 space-y-2 pt-2 pb-2">
                    {formError?.length > 0 && <ErrorMessage message={formError} />}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-gray-900">タイムセール機能の注意点</p>
                            <a
                                href="/time-sale-notice"
                                // target="_blank"
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
                        </div>

                        {/* 開始・終了日時 */}
                        {/* <ToggleRow
                            label="開始・終了日時"
                            id="startend"
                            checked={useStartEnd}
                            onChangeToggle={(v) => {
                                setUseStartEnd(v);
                                setFormError(null);
                                if (!v) {
                                    setStartDate(undefined);
                                    setStartHour(undefined);
                                    setStartMinute(undefined);
                                    setEndDate(undefined);
                                    setEndHour(undefined);
                                    setEndMinute(undefined);
                                } else {
                                    setStartHour((prev) => prev ?? '0');
                                    setStartMinute((prev) => prev ?? '0');
                                    setEndHour((prev) => prev ?? '0');
                                    setEndMinute((prev) => prev ?? '0');
                                    setStartDate(new Date());
                                    setEndDate(new Date());
                                }
                            }} 
                        /> */}

                        {useStartEnd && (
                            <div className="space-y-4">
                                {/* 開始日時 */}
                                <div className="space-y-2">
                                    <Label className="text-sm">開始日時</Label>

                                    {/* Mobile: column / Desktop: row */}
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full">
                                        <div className="w-full sm:flex-1 min-w-0">
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

                                        <div className="flex items-center gap-2 sm:w-auto">
                                            <Select
                                                value={startHour}
                                                onValueChange={(value) => {
                                                    setStartHour(value);
                                                    setFormError(null);
                                                }}
                                            >
                                                <SelectTrigger className="w-[84px]">
                                                    <SelectValue placeholder="時" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <SelectItem key={i} value={String(i)}>
                                                            {pad2(i)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm font-medium font-bold">時</span>

                                            <Select
                                                value={startMinute}
                                                onValueChange={(value) => {
                                                    setStartMinute(value);
                                                    setFormError(null);
                                                }}
                                            >
                                                <SelectTrigger className="w-[84px]">
                                                    <SelectValue placeholder="分" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    {Array.from({ length: 60 }, (_, i) => (
                                                        <SelectItem key={i} value={String(i)}>
                                                            {pad2(i)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm font-medium font-bold">分</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 終了日時 */}
                                <div className="space-y-2">
                                    <Label className="text-sm">終了日時</Label>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full">
                                        <div className="w-full sm:flex-1 min-w-0">
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

                                        <div className="flex items-center gap-2 sm:w-auto">
                                            <Select
                                                value={endHour}
                                                onValueChange={(value) => {
                                                    setEndHour(value);
                                                    setFormError(null);
                                                }}
                                            >
                                                <SelectTrigger className="w-[84px]">
                                                    <SelectValue placeholder="時" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <SelectItem key={i} value={String(i)}>
                                                            {pad2(i)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm font-medium font-bold">時</span>

                                            <Select
                                                value={endMinute}
                                                onValueChange={(value) => {
                                                    setEndMinute(value);
                                                    setFormError(null);
                                                }}
                                            >
                                                <SelectTrigger className="w-[84px]">
                                                    <SelectValue placeholder="分" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    {Array.from({ length: 60 }, (_, i) => (
                                                        <SelectItem key={i} value={String(i)}>
                                                            {pad2(i)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm font-medium font-bold">分</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                {/* <Label className="text-sm">購入制限人数</Label> */}
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

                    </div>
                </div>

                <DialogFooter className="flex flex-col gap-2 px-5 pb-5 sm:flex-row">
                    <Button variant="outline" className="w-full sm:w-1/2" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button className="w-full sm:w-1/2" onClick={handleSubmit} disabled={formError?.length > 0}>
                        作成
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
