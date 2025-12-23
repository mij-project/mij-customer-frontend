import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import AccountNavigation from '@/features/account/components/AccountNavigation';
import { getMyMessageAssets } from '@/api/endpoints/message_assets';
import { UserMessageAsset } from '@/api/types/message_asset';
import { ImageIcon, VideoIcon } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';

type MessageStatus = 'review' | 'rejected' | 'reserved';

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

export default function MessageList() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<MessageStatus>('review');
  const [assets, setAssets] = useState<UserMessageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<MessageStatus, number>>({
    review: 0,
    rejected: 0,
    reserved: 0,
  });

  const ITEMS_PER_PAGE = 20;

  // カウント取得
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await getMyMessageAssets({ skip: 0, limit: 1 });

        setStatusCounts({
          review: response.data.pending_count || 0,
          rejected: response.data.reject_count || 0,
          reserved: 0,
        });
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();
  }, []);

  // データ取得
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const response = await getMyMessageAssets({
          skip,
          limit: ITEMS_PER_PAGE,
        });

        // アクティブなステータスに応じて適切な配列を選択
        const targetAssets =
          activeStatus === 'review'
            ? response.data.pending_message_assets
            : response.data.reject_message_assets;

        setAssets(targetAssets);

        // 総ページ数を計算（仮：実際のtotal countがあれば使用）
        if (targetAssets.length < ITEMS_PER_PAGE) {
          setTotalPages(page);
        } else {
          setTotalPages(page + 1);
        }
      } catch (error) {
        console.error('Failed to fetch message assets:', error);
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [activeStatus, page]);

  const navigationItems = [
    {
      id: 'review',
      label: '審査中',
      count: statusCounts.review,
      isActive: activeStatus === 'review',
    },
    {
      id: 'rejected',
      label: '拒否',
      count: statusCounts.rejected,
      isActive: activeStatus === 'rejected',
    },
		{
			id: 'reserved',
			label: '予約中',
			count: statusCounts.reserved,
			isActive: activeStatus === 'reserved',
		}
  ];

  const handleStatusClick = (statusId: string) => {
    setActiveStatus(statusId as MessageStatus);
    setPage(1);
  };

  const handleAssetClick = (groupBy: string) => {
    navigate(`/account/message/${groupBy}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <CommonLayout header={true}>
      <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
        <AccountHeader title="メッセージの管理" showBackButton />

        {/* Navigation */}
        <div className="fixed top-10 left-0 right-0 z-10 bg-white max-w-screen-md mx-auto">
          <AccountNavigation items={navigationItems} onItemClick={handleStatusClick} />
        </div>

        {/* Content Section */}
        <div className="mt-40 px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {activeStatus === 'review' ? '審査中のメッセージはありません' : '拒否されたメッセージはありません'}
            </div>
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
                      {/* アバター - asset_typeが1の場合のみ表示 */}
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

                      {/* メッセージ内容 */}
                      <div className="flex-1 min-w-0">
                        {/* パートナー情報 - asset_typeが1の場合のみ表示 */}
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
                          {/* ラベル表示 */}
                          <p className={`font-medium text-sm truncate px-2 py-1 rounded-full flex-shrink-0 ${MESSAGE_TYPE_COLORS[asset.type]}`}>
                            {MESSAGE_TYPE_LABELS[asset.type]}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {asset.asset_type === 1 ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <VideoIcon className="w-4 h-4" />
                            )}
                            <span>{asset.asset_type === 1 ? '画像' : '動画'}</span>
                          </div>
                          <span>{convertDatetimeToLocalTimezone(asset.created_at, { second: undefined })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ページネーション */}
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
