import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import AccountNavigation from '@/features/account/components/AccountNavigation';

import { getMyMessageAssets } from '@/api/endpoints/message_assets';
import { UserMessageAsset } from '@/api/types/message_asset';

import { ImageIcon, VideoIcon, Clock, FileText, Users } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';

type MessageStatus = 'review' | 'rejected' | 'reserved';

const STATUS_LIST: MessageStatus[] = ['review', 'rejected', 'reserved'];

const MESSAGE_TYPE = {
  DM: 1,
  GROUP: 3,
} as const;

const MESSAGE_TYPE_LABELS: Record<number, string> = {
  [MESSAGE_TYPE.DM]: 'DM',
  [MESSAGE_TYPE.GROUP]: '一斉送信',
} as const;

const MESSAGE_TYPE_COLORS: Record<number, string> = {
  [MESSAGE_TYPE.DM]: 'bg-blue-100 text-blue-800',
  [MESSAGE_TYPE.GROUP]: 'bg-green-100 text-green-800',
} as const;

const ITEMS_PER_PAGE = 20;

function parseStatus(value: string | null): MessageStatus {
  if (!value) return 'review';
  return STATUS_LIST.includes(value as MessageStatus) ? (value as MessageStatus) : 'review';
}

function parsePage(value: string | null): number {
  const n = Number(value ?? '1');
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default function MessageList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL -> state (source of truth)
  const activeStatus = useMemo(() => parseStatus(searchParams.get('status')), [searchParams]);
  const page = useMemo(() => parsePage(searchParams.get('page')), [searchParams]);

  const [assets, setAssets] = useState<UserMessageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<MessageStatus, number>>({
    review: 0,
    rejected: 0,
    reserved: 0,
  });

  const setQuery = (next: { status?: MessageStatus; page?: number }, opts?: { replace?: boolean }) => {
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        const nextStatus = next.status ?? parseStatus(sp.get('status'));
        const nextPage = next.page ?? parsePage(sp.get('page'));

        sp.set('status', nextStatus);
        sp.set('page', String(nextPage));

        return sp;
      },
      { replace: opts?.replace ?? false },
    );
  };

  // 初回：URLにstatus/pageが無い場合は補完（これで常にBack復元OK）
  useEffect(() => {
    const hasStatus = searchParams.has('status');
    const hasPage = searchParams.has('page');
    if (!hasStatus || !hasPage) {
      setQuery({ status: activeStatus, page }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // カウント取得
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await getMyMessageAssets({ skip: 0, limit: 1 });
        setStatusCounts({
          review: response.data.pending_count || 0,
          rejected: response.data.reject_count || 0,
          reserved: response.data.reserved_count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };
    fetchCounts();
  }, []);

  // データ取得（status/page 変化で再取得）
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const response = await getMyMessageAssets({ skip, limit: ITEMS_PER_PAGE });

        const targetAssets =
          activeStatus === 'review'
            ? response.data.pending_message_assets
            : activeStatus === 'rejected'
              ? response.data.reject_message_assets
              : response.data.reserved_message_assets;

        setAssets(targetAssets);

        // totalPages はAPIに total が無い前提で簡易推定
        if (targetAssets.length < ITEMS_PER_PAGE) setTotalPages(page);
        else setTotalPages(page + 1);
      } catch (error) {
        console.error('Failed to fetch message assets:', error);
        setAssets([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [activeStatus, page]);

  useEffect(() => {
    const flag = sessionStorage.getItem('scrollToTopOnBack');
    if (flag === '1') {
      sessionStorage.removeItem('scrollToTopOnBack');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, []);

  const navigationItems = useMemo(
    () => [
      { id: 'review', label: '審査中', count: statusCounts.review, isActive: activeStatus === 'review' },
      { id: 'rejected', label: '拒否', count: statusCounts.rejected, isActive: activeStatus === 'rejected' },
      { id: 'reserved', label: '予約中', count: statusCounts.reserved, isActive: activeStatus === 'reserved' },
    ],
    [activeStatus, statusCounts],
  );

  const emptyText = useMemo(() => {
    if (activeStatus === 'review') return '審査中のメッセージはありません';
    if (activeStatus === 'rejected') return '拒否されたメッセージはありません';
    return '予約中のメッセージはありません';
  }, [activeStatus]);

  const handleStatusClick = (statusId: string) => {
    const nextStatus = parseStatus(statusId);
    setQuery({ status: nextStatus, page: 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssetClick = (groupBy: string) => {
    // 拒否ステータスの場合のみ編集ページに遷移
    if (activeStatus === 'rejected') {
      navigate(`/account/message/edit/${groupBy}`);
    } else {
      navigate(`/account/message/${groupBy}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    const nextPage = Math.max(1, Math.min(newPage, totalPages));
    setQuery({ page: nextPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CommonLayout header={true}>
      <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
        <AccountHeader title="メッセージの管理" showBackButton />

        {/* Navigation */}
        <div className="fixed top-10 left-0 right-0 z-10 bg-white max-w-screen-md mx-auto">
          <AccountNavigation items={navigationItems} onItemClick={handleStatusClick} />
        </div>

        {/* Content */}
        <div className="mt-40 px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">{emptyText}</div>
          ) : (
            <>
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleAssetClick(asset.group_by)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex gap-3">
                      {/* Avatar (DM only) */}
                      {asset.type === MESSAGE_TYPE.DM && (
                        <div className="flex-shrink-0">
                          {asset.partner_avatar ? (
                            <img
                              src={asset.partner_avatar}
                              alt={asset.partner_profile_name || ''}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {asset.partner_profile_name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        {/* Partner info (DM only) */}
                        {asset.type === MESSAGE_TYPE.DM && (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {asset.partner_profile_name || 'Unknown User'}
                            </p>
                            {asset.partner_username && (
                              <p className="text-xs text-gray-500">@{asset.partner_username}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm text-gray-700 line-clamp-2 flex-1">
                            {asset.message_text || 'メッセージ本文なし'}
                          </p>

                          <p
                            className={`font-medium text-sm truncate px-2 py-1 rounded-full flex-shrink-0 ${MESSAGE_TYPE_COLORS[asset.type]}`}
                          >
                            {MESSAGE_TYPE_LABELS[asset.type]}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            {asset.asset_type === 1 ? (
                              <>
                                <ImageIcon className="w-4 h-4" />
                                <span>画像</span>
                              </>
                            ) : asset.asset_type === 2 ? (
                              <>
                                <VideoIcon className="w-4 h-4" />
                                <span>動画</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4" />
                                <span>テキストのみ</span>
                              </>
                            )}
                          </div>

                          {/* Scheduled time (reserved only) */}
                          {activeStatus === 'reserved' && asset.scheduled_at && (
                            <div className="flex items-center gap-1 text-primary font-medium">
                              <Clock className="w-4 h-4" />
                              <span>
                                {convertDatetimeToLocalTimezone(asset.scheduled_at, { second: undefined })}
                              </span>
                            </div>
                          )}

                          {/* Recipient count (reserved only) */}
                          {activeStatus === 'reserved' && asset.recipient_count && asset.recipient_count > 0 && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{asset.recipient_count}人に送信予定</span>
                            </div>
                          )}

                          {/* Created time (not scheduled) */}
                          {!asset.scheduled_at && (
                            <span>{convertDatetimeToLocalTimezone(asset.created_at, { second: undefined })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pb-4">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    前へ
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <BottomNavigation />
      </div>
    </CommonLayout>
  );
}
