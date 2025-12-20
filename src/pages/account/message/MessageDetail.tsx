import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getMyMessageAssetDetail } from '@/api/endpoints/message_assets';
import { UserMessageAssetDetailResponse } from '@/api/types/message_asset';
import { ImageIcon, VideoIcon, MessageSquare } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const STATUS_LABELS: Record<number, string> = {
  0: '審査中',
  1: '承認済み',
  2: '拒否',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-800',
  1: 'bg-green-100 text-green-800',
  2: 'bg-red-100 text-red-800',
};

export default function MessageDetail() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<UserMessageAssetDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) {
      setError('アセットIDが指定されていません');
      setIsLoading(false);
      return;
    }

    const fetchAssetDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyMessageAssetDetail(assetId);
        console.log('response.data', response.data);
        setAsset(response.data);
      } catch (err: any) {
        console.error('Failed to fetch asset detail:', err);
        if (err.response?.status === 404) {
          setError('メッセージアセットが見つかりません');
        } else if (err.response?.status === 403) {
          setError('このメッセージにアクセスする権限がありません');
        } else {
          setError('メッセージアセットの取得に失敗しました');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetDetail();
  }, [assetId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGoToConversation = () => {
    if (asset?.conversation_id) {
      navigate(`/message/conversation/${asset.conversation_id}`);
    }
  };

  if (isLoading) {
    return (
      <CommonLayout header={true}>
        <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white">
          <AccountHeader title="メッセージ詳細" showBackButton />
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (error || !asset) {
    return (
      <CommonLayout header={true}>
        <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white">
          <AccountHeader title="メッセージ詳細" showBackButton />
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-red-600 text-center mb-4">{error || 'データが見つかりません'}</p>
            <button
              onClick={() => navigate('/account/message')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white pb-20">
        <div className="fixed top-0 left-0 right-0 z-20 bg-white max-w-screen-md mx-auto">
          <AccountHeader title="メッセージ詳細" showBackButton />
        </div>

        <div className="pt-16 px-4 space-y-6">
          {/* ステータスバッジ */}
          <div className="flex items-center justify-between pt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[asset.status]}`}>
              {STATUS_LABELS[asset.status]}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {asset.asset_type === 1 ? (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>画像</span>
                </>
              ) : (
                <>
                  <VideoIcon className="w-4 h-4" />
                  <span>動画</span>
                </>
              )}
            </div>
          </div>

          {/* 送信先情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">送信先</h3>
            <div className="flex items-center gap-3">
              {asset.partner_avatar ? (
                <img
                  src={asset.partner_avatar}
                  alt={asset.partner_profile_name || ''}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {asset.partner_profile_name?.[0] || '?'}
                </div>
              )}
              <div>
                <p className="font-medium">{asset.partner_profile_name || 'Unknown User'}</p>
                {asset.partner_username && (
                  <p className="text-sm text-gray-500">@{asset.partner_username}</p>
                )}
              </div>
            </div>
          </div>

          {/* メッセージ内容 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">メッセージ内容</h3>
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {asset.message_text || 'メッセージ本文なし'}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              送信日時: {convertDatetimeToLocalTimezone(asset.message_created_at, { second: undefined })}
            </p>
          </div>

          {/* アセットプレビュー */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              {asset.asset_type === 1 ? (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>画像</span>
                </>
              ) : (
                <>
                  <VideoIcon className="w-4 h-4" />
                  <span>動画</span>
                </>
              )}
            </h3>
            <div className="bg-gray-200 rounded-lg overflow-hidden">
              {asset.asset_type === 1 ? (
                <img
                  src={asset.cdn_url || ''}
                  alt="Message asset"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64">
                  {asset.cdn_url && (
                    <CustomVideoPlayer
                      videoUrl={asset.cdn_url}
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}
            </div>
         
          </div>

          {/* 拒否理由（拒否された場合のみ） */}
          {asset.status === 2 && asset.reject_comments && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">拒否理由</h3>
              <p className="text-red-900 whitespace-pre-wrap break-words">
                {asset.reject_comments}
              </p>
            </div>
          )}

          {/* メタ情報 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">作成日時</span>
              <span className="text-gray-900">{convertDatetimeToLocalTimezone(asset.created_at, { second: undefined })}</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3 pb-4">
            {asset.status === 2 && (
              <button
                onClick={() => navigate(`/account/message/edit/${assetId}`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                編集して再申請
              </button>
            )}
            <button
              onClick={handleGoToConversation}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <MessageSquare className="w-5 h-5" />
              会話画面に移動
            </button>
            <button
              onClick={() => navigate('/account/message')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              一覧に戻る
            </button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </CommonLayout>
  );
}
