import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountHeader from '@/features/account/components/AccountHeader';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { getMyMessageAssetDetail, deleteReservedMessage } from '@/api/endpoints/message_assets';
import { UserMessageAssetDetailResponse } from '@/api/types/message_asset';
import { ImageIcon, VideoIcon, MessageSquare, Clock, Edit, Trash2 } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import CustomVideoPlayer from '@/features/shareVideo/componets/CustomVideoPlayer';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

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

const STATUS_LABELS: Record<number, string> = {
  0: '審査中',
  1: '承認済み',
  2: '拒否',
  3: '予約',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-800',
  1: 'bg-green-100 text-green-800',
  2: 'bg-red-100 text-red-800',
  3: 'bg-purple-100 text-purple-800',
};

export default function MessageDetail() {
  const { groupBy } = useParams<{ groupBy: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<UserMessageAssetDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!groupBy) {
      setError('アセットIDが指定されていません');
      setIsLoading(false);
      return;
    }

    const fetchAssetDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyMessageAssetDetail(groupBy);
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
  }, [groupBy]);

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

  const handleBack = () => {
    sessionStorage.setItem('scrollToTopOnBack', '1');
    navigate(-1);
  };

  const handleGoToConversation = () => {
    if (asset?.conversation_id) {
      navigate(`/message/conversation/${asset.conversation_id}`);
    }
  };

  // 表示用のステータスを取得（予約中の判定を含む）
  const getDisplayStatus = (asset: UserMessageAssetDetailResponse): number => {
    // 予約中の条件: conversation_messageのステータスが2（PENDING）の場合
    if (asset.message_status === 2) {
      return 3; // 予約中
    }
    return asset.status; // それ以外は通常のステータスを返す
  };

  const handleDeleteMessageAsset = async () => {
    if (!groupBy) return;

    setIsDeleting(true);
    try {
      await deleteReservedMessage(groupBy);
      // 削除成功後、メッセージ一覧に戻る
      navigate('/account/message');
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      alert('削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <CommonLayout header={true}>
        <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white">
          <AccountHeader
            title="メッセージ詳細"
            showBackButton
            onBack={handleBack}
          />
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
          <AccountHeader
            title="メッセージ詳細"
            showBackButton
            onBack={handleBack}
          />
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-red-600 text-center mb-4">{error || 'データが見つかりません'}</p>
            <button
              onClick={handleBack}
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
          <AccountHeader
            title="メッセージ詳細"
            showBackButton
            onBack={handleBack}
          />
        </div>

        <div className="pt-16 px-4 space-y-6">
          {/* ステータスバッジ */}
          <div className="flex items-center justify-between pt-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[getDisplayStatus(asset)]}`}
            >
              {STATUS_LABELS[getDisplayStatus(asset)]}
            </span>
            {asset.cdn_url && (
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
                <p
                  className={`font-medium text-sm truncate px-2 py-1 rounded-full flex-shrink-0 ${MESSAGE_TYPE_COLORS[asset.type]}`}
                >
                  {MESSAGE_TYPE_LABELS[asset.type]}
                </p>
              </div>
            )}
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

          {/* 送信先情報 */}
          {asset.type === MESSAGE_TYPE.DM && (
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
          )}

          {/* メッセージ内容 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">メッセージ内容</h3>
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {asset.message_text || 'メッセージ本文なし'}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              送信日時:{' '}
              {convertDatetimeToLocalTimezone(asset.message_created_at, { second: undefined })}
            </p>
          </div>

          {/* アセットプレビュー - アセットがある場合のみ表示 */}
          {asset.cdn_url && (
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
              <div
                className={`bg-gray-200 rounded-lg overflow-auto flex items-center justify-center ${asset.asset_type === 1 ? 'min-h-[256px]' : 'min-h-[70vh]'}`}
              >
                {asset.asset_type === 1 ? (
                  <img
                    src={asset.cdn_url}
                    alt="Message asset"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <CustomVideoPlayer videoUrl={asset.cdn_url} className="max-w-full max-h-full" />
                )}
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">作成日時</span>
              <span className="text-gray-900">
                {convertDatetimeToLocalTimezone(asset.created_at, { second: undefined })}
              </span>
            </div>
            {asset.scheduled_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  予約送信日時
                </span>
                <span className="text-primary font-medium">
                  {convertDatetimeToLocalTimezone(asset.scheduled_at, { second: undefined })}
                </span>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="space-y-3 pb-4">
            {(asset.status === 2 || getDisplayStatus(asset) === 3) && (
              <button
                onClick={() => navigate(`/account/message/edit/${groupBy}`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-5 h-5" />
                {asset.status === 2 ? '編集して再申請' : '予約内容を編集'}
              </button>
            )}
            {/* 予約中の場合のみ削除ボタンを表示 */}
            {asset.message_status === 2 && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="w-5 h-5" />
                予約メッセージを削除
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
              onClick={handleBack}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              一覧に戻る
            </button>
          </div>
        </div>

        {/* 削除確認ダイアログ */}
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteMessageAsset}
          isDeleting={isDeleting}
          title="予約メッセージを削除しますか？"
          message="この操作は取り消せません。予約されたメッセージと関連するファイルがすべて削除されます。"
        />

        <BottomNavigation />
      </div>
    </CommonLayout>
  );
}
