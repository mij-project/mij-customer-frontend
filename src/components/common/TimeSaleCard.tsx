import { Button } from "@/components/ui/button";
import convertDatetimeToLocalTimezone from "@/utils/convertDatetimeToLocalTimezone";
import { formatPrice } from "@/lib/utils";
import { MoreVertical, Tags } from "lucide-react";

export default function TimeSaleCard({ item, originalPrice }: { item: any; originalPrice?: number }) {
    const id = String(item.id ?? item.time_sale_id ?? '');
    const percent = item.sale_percentage ?? 0;

    // 割引金額を計算
    const discountAmount = originalPrice ? Math.ceil(originalPrice * percent * 0.01) : null;
    // 割引後の金額を計算
    const discountedPrice = originalPrice && discountAmount ? originalPrice - discountAmount : null;

    const start = item.start_date ? convertDatetimeToLocalTimezone(item.start_date) : null;
    const end = item.end_date ? convertDatetimeToLocalTimezone(item.end_date) : null;
    const createdAt = item.created_at ? convertDatetimeToLocalTimezone(item.created_at) : null;

    const purchaseCount = Number(item.purchase_count ?? 0);
    const maxCount = item.max_purchase_count ?? null;

    const isActive = Boolean(item.is_active);
    const isExpired = Boolean(item.is_expired);

    const leftBadge1 = isActive ? '有効' : '無効';
    let leftBadge2 = "-";

    if (isExpired) {
        leftBadge2 = '期限切れ';
    } else {
        leftBadge2 = '進行中';
    }
    if (start && new Date(start) > new Date()) {
        leftBadge2 = '開始予定';
    }

    const periodLabel =
        start && end
            ? `${start.substring(0, 16)} 〜 ${end.substring(0, 16)}`
            : "-"

    const purchaseLabel = purchaseCount

    const maxCountLabel = maxCount != null ? `${maxCount}` : "-";

    return (
        <div className="bg-white border border-gray-200 shadow-sm p-5 flex-col items-start justify-start space-y-4">
            {/* Top row: badges left, menu right */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 ${isActive ? 'bg-secondary text-secondary-foreground' : 'bg-gray-100 text-gray-500'} text-sm font-bold`}>
                        {leftBadge1}
                    </span>
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold">
                        {leftBadge2}
                    </span>
                </div>
            </div>

            {/* Title - Discount Info */}
            <div className="space-y-2">
                <div>
                    <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Tags className="w-4 h-4" />
                        {percent}%割引
                    </span>
                </div>

                {/* 価格情報 */}
                {originalPrice && discountAmount !== null && discountedPrice !== null && (
                    <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">定価：</span>
                            <span className="text-gray-900 font-semibold">¥{formatPrice(originalPrice)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">割引額：</span>
                            <span className="text-red-600 font-semibold">-¥{formatPrice(discountAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                            <span className="text-gray-500 font-semibold">セール価格：</span>
                            <span className="text-primary font-bold text-base">¥{formatPrice(discountedPrice)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm text-gray-500">購入数: {purchaseLabel}</p>
            </div>
            {/* 3 columns like your UI */}
            <div className="flex items-start justify-between flex-col gap-2">
                <div>
                    <p className="text-sm text-gray-500">期間: {periodLabel}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">購入制限人数: {maxCountLabel}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">作成日: {createdAt ?? '-'}</p>
                </div>
            </div>
        </div>
    );
}
