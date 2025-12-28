import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Tags } from 'lucide-react';
import { toast } from 'sonner';

import { PostDetailData } from '@/api/types/post';
import { TimeSalePriceInfo } from '@/api/types/time_sale';
import { createPostPriceTimeSale, getPostDetail, getPostTimeSalePriceInfo } from '@/api/endpoints/post';

import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common';
import { formatPrice } from '@/lib/utils';
import CreateTimeSaleModal from '@/components/common/CreateTimeSaleModal';
import TimeSaleCard from '@/components/common/TimeSaleCard';

const LIMIT = 20;
const MODAL_PARAM_KEY = 'ts_modal';

function clampInt(value: string | null, fallback: number, min: number, max: number) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    const i = Math.floor(n);
    return Math.max(min, Math.min(max, i));
}

export default function PostPriceTimesaleSetting() {
    const navigate = useNavigate();
    const { post_id } = useParams<{ post_id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = useMemo(
        () => clampInt(searchParams.get('page'), 1, 1, 9999),
        [searchParams]
    );

    const isModalOpen = useMemo(
        () => searchParams.get(MODAL_PARAM_KEY) === '1',
        [searchParams]
    );

    const [post, setPost] = useState<PostDetailData | null>(null);
    const [timeSalePriceInfos, setTimeSalePriceInfos] = useState<TimeSalePriceInfo[]>([]);
    const [hasNext, setHasNext] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [error, setError] = useState<{ show: boolean; messages: string[] }>({
        show: false,
        messages: [],
    });

    // 1) URLのpage/limitを揃える（historyを汚さないため replace）
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

    // 共通：検索パラメータ更新（ts_modal含め既存を維持）
    const updateQuery = useCallback(
        (next: { page?: number }) => {
            const sp = new URLSearchParams(searchParams);
            sp.set('page', String(next.page ?? page));
            sp.set('limit', String(LIMIT));
            setSearchParams(sp);
        },
        [searchParams, page, setSearchParams]
    );

    // Modal open/close：URLで管理（戻る/進むでも状態が戻る）
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

    // 2) Post 取得
    useEffect(() => {
        if (!post_id) return;

        const run = async () => {
            try {
                const res = await getPostDetail(post_id);
                if (res) setPost(res);
            } catch (e) {
                setError({ show: true, messages: ['投稿の取得に失敗しました。再度お試しください。'] });
                console.error('Failed to fetch post:', e);
            }
        };

        run();
    }, [post_id]);

    // 3) List 取得
    const fetchTimeSaleList = useCallback(
        async (pid: string, p: number, l: number) => {
            try {
                setLoadingList(true);
                setError((prev) => ({ ...prev, show: false }));

                const response = await getPostTimeSalePriceInfo(pid, p, l);
                const items: TimeSalePriceInfo[] = response.data.time_sales || [];
                const has_next: boolean = Boolean(response.data.has_next);

                setTimeSalePriceInfos(items);
                setHasNext(has_next);
            } catch (e) {
                setError({ show: true, messages: ['タイムセール一覧の取得に失敗しました。再度お試しください。'] });
                console.error('Failed to fetch time sale list:', e);
            } finally {
                setLoadingList(false);
            }
        },
        []
    );

    useEffect(() => {
        if (!post_id) return;
        fetchTimeSaleList(post_id, page, LIMIT);
    }, [post_id, page, fetchTimeSaleList]);

    // 4) Create
    const handleCreateTimeSale = async (payload: {
        percent: number;
        hasStartEnd: boolean;
        startDateTime?: Date;
        endDateTime?: Date;
        hasMaxPurchaseCount: boolean;
        maxPurchaseCount?: number;
    }) => {
        setError({ show: false, messages: [] });

        if (!post_id) return;

        try {
            const request = {
                start_date: payload.hasStartEnd ? payload.startDateTime : null,
                end_date: payload.hasStartEnd ? payload.endDateTime : null,
                sale_percentage: payload.percent,
                max_purchase_count: payload.hasMaxPurchaseCount ? payload.maxPurchaseCount : null,
            };

            const response = await createPostPriceTimeSale(post_id, request);

            if (response.status === 200) {
                toast('タイムセールを作成しました。', {
                    icon: <Check className="w-4 h-4" color="#6DE0F7" />,
                });

                // ここがポイント：
                // modal を閉じる + page=1 に戻す、を「1回の setSearchParams」でやる
                const sp = new URLSearchParams(searchParams);
                sp.delete(MODAL_PARAM_KEY);
                sp.set('page', '1');
                sp.set('limit', String(LIMIT));
                setSearchParams(sp);

                await fetchTimeSaleList(post_id, 1, LIMIT);
            }
        } catch (err) {
            if (err instanceof AxiosError && err.response?.status === 400) {
                setError({ show: true, messages: ['既存のタイムセールが存在します。終了までお待ちください。'] });
            } else {
                setError({ show: true, messages: ['タイムセールの作成に失敗しました。再度お試しください。'] });
            }
            // エラー時は modal を閉じたくないなら、何もしない
            // 閉じたい場合は closeModal() を呼ぶ
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
                        onClick={() => navigate('/account/post')}
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

                    {/* Post Basic Information */}
                    {post && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <img
                                src={post.thumbnail_key || '/assets/no-image.svg'}
                                alt={post.description}
                                className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-gray-900">{post.description}</p>
                                <p className="text-sm font-bold text-gray-900">
                                    単品価格：¥ {formatPrice(post?.sale_info?.price?.price || 0)}
                                </p>
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

                        {/* List */}
                        <div className="bg-white border border-gray-200 overflow-hidden">
                            {loadingList ? (
                                <div className="p-4 text-sm text-gray-600" />
                            ) : timeSalePriceInfos.length === 0 ? (
                                <div className="p-4 text-sm text-gray-600 text-center">タイムセールはまだありません。</div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {timeSalePriceInfos.map((item: any) => (
                                        <TimeSaleCard
                                            key={item.id}
                                            item={item}
                                            originalPrice={post?.sale_info?.price?.price || 0}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination (左右の位置を固定したい場合：枠の幅を揃える) */}
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

            <CreateTimeSaleModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleCreateTimeSale}
                originalPrice={post?.sale_info?.price?.price || 0}
            />
        </div>
    );
}
