import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationWebSocket } from '@/hooks/useConversationWebSocket';
import {
  getConversationMessages,
  sendConversationMessage,
  getMessageAssetUploadUrl,
} from '@/api/endpoints/conversation';
import { MessageResponse } from '@/api/types/conversation';
import { me } from '@/api/endpoints/auth';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Gift,
  Heart,
  LockKeyhole,
  Paperclip,
  X,
  Image as ImageIcon,
  Video,
  Send,
} from 'lucide-react';
import noImageSvg from '@/assets/no-image.svg';
import ChipPaymentDialog from '@/components/common/ChipPaymentDialog';
import { useAuth } from '@/providers/AuthContext';
import { putToPresignedUrl } from '@/service/s3FileUpload';

export default function Conversation() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { messages: wsMessages, sendMessage, isConnected, error } = useConversationWebSocket(conversationId || '');
  const { user, isCreator } = useAuth();
  const [allMessages, setAllMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [animatingChipId, setAnimatingChipId] = useState<string | null>(null);
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [isChipDialogOpen, setIsChipDialogOpen] = useState(false);

  // ファイルアップロード関連
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [errorHeight, setErrorHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(64);

  // 初期データを取得
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!conversationId) {
        navigate('/message');
        return;
      }

      try {
        // 現在のユーザー情報を取得
        const user = await me();
        setCurrentUserId(user.data.id);

        // メッセージ一覧を取得（相手のプロフィール情報も含む）
        const messagesResponse = await getConversationMessages(conversationId, 0, 50);
        setAllMessages(messagesResponse.data.messages);

        setCanSendMessage(messagesResponse.data.can_send_message);

        // APIレスポンスから相手の情報を取得
        if (messagesResponse.data.partner_profile_name) {
          setPartnerName(messagesResponse.data.partner_profile_name);
        }
        if (messagesResponse.data.partner_avatar) {
          setPartnerAvatar(messagesResponse.data.partner_avatar);
        }
        if (messagesResponse.data.partner_user_id) {
          setPartnerUserId(messagesResponse.data.partner_user_id);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [conversationId, navigate]);

  // WebSocketから新しいメッセージが来たら追加
  useEffect(() => {
    if (wsMessages.length > 0) {
      setAllMessages((prev) => {
        // 重複を避ける
        const newMessages = wsMessages.filter((wsMsg) => !prev.some((msg) => msg.id === wsMsg.id));
        return [...prev, ...newMessages];
      });
    }
  }, [wsMessages]);

  // ヘッダーの高さを取得
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // エラー表示の高さを取得
  useEffect(() => {
    const updateErrorHeight = () => {
      if (errorRef.current) {
        const height = errorRef.current.offsetHeight;
        setErrorHeight(height);
      } else {
        setErrorHeight(0);
      }
    };

    updateErrorHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateErrorHeight();
    });

    if (errorRef.current) {
      resizeObserver.observe(errorRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [error]);

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // ファイル選択ハンドラー
  const handleFileSelect = (file: File) => {
    // ファイルタイプの検証
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime'];

    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      alert('画像（JPEG, PNG, GIF, WebP）または動画（MP4, MOV）のみアップロード可能です');
      return;
    }

    // ファイルサイズの検証（500MB）
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ファイルサイズは500MB以下にしてください');
      return;
    }

    setSelectedFile(file);

    // プレビュー用のURLを生成
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // ファイル入力変更ハンドラー
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // ドラッグ&ドロップハンドラー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // ファイル選択をキャンセル
  const handleCancelFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // メッセージ送信（テキストまたはアセット）
  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedFile) return;
    if (!conversationId) return;

    try {
      setIsUploading(true);
      let assetStorageKey: string | null = null;
      let assetType: number | null = null;

      // ファイルがある場合はアップロード処理
      if (selectedFile) {
        const fileExtension = selectedFile.name.split('.').pop() || '';
        const isImage = selectedFile.type.startsWith('image/');
        assetType = isImage ? 1 : 2; // 1=画像, 2=動画

        // Presigned URL取得
        const uploadUrlResponse = await getMessageAssetUploadUrl(conversationId, {
          asset_type: assetType,
          content_type: selectedFile.type,
          file_extension: fileExtension,
        });


        await putToPresignedUrl({
          key: uploadUrlResponse.data.storage_key,
          upload_url: uploadUrlResponse.data.upload_url,
          expires_in: uploadUrlResponse.data.expires_in,
          required_headers: uploadUrlResponse.data.required_headers,
        }, selectedFile, uploadUrlResponse.data.required_headers);
        assetStorageKey = uploadUrlResponse.data.storage_key;

        setUploadProgress(100);
      }

      // メッセージ送信（REST API経由）
      const messageResponse = await sendConversationMessage(conversationId, {
        body_text: inputText.trim() || null,
        asset_storage_key: assetStorageKey,
        asset_type: assetType,
      });

      // 送信したメッセージを即座に表示
      setAllMessages((prev) => [...prev, messageResponse.data]);

      // 入力をクリア
      setInputText('');
      handleCancelFile();
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // タイムスタンプをフォーマット
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 日付と曜日をフォーマット
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 日付を比較（時刻を除く）
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDate.getTime() === todayDate.getTime()) {
      return '今日';
    } else if (messageDate.getTime() === yesterdayDate.getTime()) {
      return '昨日';
    } else {
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = weekdays[date.getDay()];
      return `${month}/${day}(${weekday})`;
    }
  };

  // 同じ日付かどうかを判定
  const isSameDate = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Enterキーのハンドリング
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter (Windows) または Cmd+Enter (Mac) で送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // チップメッセージクリック時のアニメーション
  const handleChipClick = (messageId: string) => {
    setAnimatingChipId(messageId);
    setTimeout(() => {
      setAnimatingChipId(null);
    }, 1000);
  };

  // テキストエリアの自動リサイズ
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = '0px';

    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight || '20');
    const paddingTop = parseFloat(style.paddingTop || '0');
    const paddingBottom = parseFloat(style.paddingBottom || '0');

    const maxHeight = lineHeight * 5 + paddingTop + paddingBottom;

    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;

    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputText]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ヘッダー */}
      <div
        ref={headerRef}
        className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-10 flex justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center flex-1 justify-center gap-3">
          <img
            src={partnerAvatar || noImageSvg}
            alt={partnerName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="text-xl font-semibold">{partnerName || '会話'}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          ref={errorRef}
          className="fixed left-0 right-0 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm"
          style={{ top: `${headerHeight}px` }}
        >
          {error}
        </div>
      )}

      {/* メッセージ一覧 */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
        style={{ paddingTop: `${headerHeight + errorHeight + 16}px` }}
      >
        {allMessages.map((message, index) => {
          // 送信者が現在のユーザーかどうかを判定
          const isCurrentUser = currentUserId && message.sender_user_id === currentUserId;

          // 前のメッセージと日付が異なる場合は日付を表示
          const showDateSeparator =
            index === 0 ||
            !isSameDate(message.created_at, allMessages[index - 1].created_at);

          return (
            <div key={message.id}>
              {/* 日付セパレーター */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {formatDate(message.created_at)}
                  </div>
                </div>
              )}

              <div
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[95%]`}
                >
                  {/* アバター（相手のメッセージの場合のみ表示） */}
                  {!isCurrentUser && (
                    <img
                      src={partnerAvatar || noImageSvg}
                      alt={partnerName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                  )}

                  {/* メッセージバブル */}
                  <div className={isCurrentUser ? 'flex flex-col items-end' : 'flex-1'}>
                    {/* 相手のメッセージの場合は名前を表示 */}
                    {!isCurrentUser && (
                      <div className="text-md text-gray-500 mb-1">{partnerName}</div>
                    )}
                    <div className={`flex items-end gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {message.type === 2 ? (
                        // ===== チップ =====
                        <div className={isCurrentUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                          {/* ===== 「最後のバブル + time」行 ===== */}
                          <div className={`flex items-end gap-1 ${isCurrentUser ? 'flex-row' : 'flex-row'}`}>
                            {/* currentUser は time を左に置きたいので time を先に描画 */}
                            {isCurrentUser && (
                              <div className="text-xs text-gray-400 whitespace-nowrap mb-1">
                                {formatTimestamp(convertDatetimeToLocalTimezone(message.created_at))}
                              </div>
                            )}

                            <div
                              onClick={() => handleChipClick(message.id)}
                              className="relative cursor-pointer"
                            >
                              <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-300 shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-2 mb-1">
                                  <Gift className="w-5 h-5 text-amber-600" />
                                  <span className="text-sm font-semibold text-amber-700">チップ</span>
                                </div>
                                <p className="break-words whitespace-pre-wrap text-gray-800 font-medium">
                                  {message.body_text}
                                </p>
                              </div>

                              {animatingChipId === message.id && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {[...Array(5)].map((_, i) => (
                                    <Heart
                                      key={i}
                                      className="absolute text-red-500 fill-red-500 animate-float-heart"
                                      style={{
                                        left: `${30 + i * 15}%`,
                                        bottom: '0',
                                        animationDelay: `${i * 100}ms`,
                                        width: '20px',
                                        height: '20px',
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* partner は time を右に置きたいので後に描画 */}
                            {!isCurrentUser && (
                              <div className="text-xs text-gray-400 whitespace-nowrap mb-1">
                                {formatTimestamp(convertDatetimeToLocalTimezone(message.created_at))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // ===== 通常 =====
                        <div className={isCurrentUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                          {/* ===== 1) アセットがあり、かつテキストもある場合：アセットは上に単独 ===== */}
                          {message.type !== 2 && message.asset && message.body_text && (
                            <div className={`mb-2 ${message.asset.status === 0 ? 'opacity-50' : ''}`}>
                              {message.asset.status === 1 && message.asset.cdn_url ? (
                                message.asset.asset_type === 1 ? (
                                  <img src={message.asset.cdn_url} className="max-w-xs rounded-lg" />
                                ) : (
                                  <video src={message.asset.cdn_url} controls className="max-w-xs rounded-lg" />
                                )
                              ) : (
                                <div className="bg-gray-200 rounded-lg max-w-md p-20">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    {message.asset.asset_type === 1 ? (
                                      <ImageIcon className="w-5 h-5" />
                                    ) : (
                                      <Video className="w-5 h-5" />
                                    )}
                                    <span className="text-sm font-medium">
                                      {message.asset.status === 0 ? '審査中' : '審査中'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ===== 2) 「最後のバブル + time」行（ここがズレないポイント） ===== */}
                          <div className={`flex items-end gap-1 ${isCurrentUser ? 'flex-row' : 'flex-row'}`}>
                            {/* currentUser は time を左に置きたいので time を先に描画 */}
                            {isCurrentUser && (
                              <div className="text-xs text-gray-400 whitespace-nowrap mb-1">
                                {formatTimestamp(convertDatetimeToLocalTimezone(message.created_at))}
                              </div>
                            )}

                            {/* last bubble */}
                            {message.type === 2 ? (
                              <div onClick={() => handleChipClick(message.id)} className="relative cursor-pointer">
                                <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-300 shadow-md hover:shadow-lg transition-shadow">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Gift className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-semibold text-amber-700">チップ</span>
                                  </div>
                                  <p className="break-words whitespace-pre-wrap text-gray-800 font-medium">
                                    {message.body_text}
                                  </p>
                                </div>
                                {animatingChipId === message.id && (
                                  <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                      <Heart
                                        key={i}
                                        className="absolute text-red-500 fill-red-500 animate-float-heart"
                                        style={{
                                          left: `${30 + i * 15}%`,
                                          bottom: '0',
                                          animationDelay: `${i * 100}ms`,
                                          width: '20px',
                                          height: '20px',
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : message.body_text ? (
                              <div
                                className={`w-fit max-w-[80vw] sm:max-w-md px-4 py-2 rounded-2xl ${
                                  isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-900'
                                }`}
                              >
                                <p className="break-words whitespace-pre-wrap">{message.body_text}</p>
                              </div>
                            ) : message.asset ? (
                              <div className={`${message.asset.status === 0 ? 'opacity-50' : ''}`}>
                                {message.asset.status === 1 && message.asset.cdn_url ? (
                                  message.asset.asset_type === 1 ? (
                                    <img src={message.asset.cdn_url} className="max-w-xs rounded-lg" />
                                  ) : (
                                    <video src={message.asset.cdn_url} controls className="max-w-xs rounded-lg" />
                                  )
                                ) : (
                                  <div className="bg-gray-200 rounded-lg max-w-md p-20">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      {message.asset.asset_type === 1 ? (
                                        <ImageIcon className="w-5 h-5" />
                                      ) : (
                                        <Video className="w-5 h-5" />
                                      )}
                                      <span className="text-sm font-medium">
                                        {message.asset.status === 0 ? '審査中' : '審査中'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {/* partner は time を右に置きたいので後に描画 */}
                            {!isCurrentUser && (
                              <div className="text-xs text-gray-400 whitespace-nowrap mb-1">
                                {formatTimestamp(convertDatetimeToLocalTimezone(message.created_at))}
                              </div>
                            )}
                          </div>
                        </div>  
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4"
        onDragOver={canSendMessage || isCreator() ? handleDragOver : undefined}
        onDragLeave={canSendMessage || isCreator() ? handleDragLeave : undefined}
        onDrop={canSendMessage || isCreator() ? handleDrop : undefined}
      >
        {/* ドラッグ&ドロップオーバーレイ */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-20">
            <div className="text-primary font-semibold">ファイルをドロップ</div>
          </div>
        )}

        {/* ファイルプレビュー */}
        {selectedFile && previewUrl && (
          <div className="mb-3 relative inline-block">
            <div className="relative">
              {selectedFile.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg" />
              ) : (
                <video src={previewUrl} className="max-h-32 rounded-lg" />
              )}
              <button
                onClick={handleCancelFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-600 mt-1 max-w-xs truncate">
              {selectedFile.name}
            </div>
          </div>
        )}

        {/* アップロード進捗バー */}
        {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>アップロード中...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          {canSendMessage || isCreator() ? (
            <>
              {/* ファイル選択ボタン（クリエイターのみ表示） */}
              {isCreator() && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isConnected || isUploading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="画像/動画を選択"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </>
              )}

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力"
                rows={1}
                className="
                  flex-1 border border-gray-300
                  bg-transparent text-gray-900
                  rounded-2xl px-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-primary
                  resize-none overflow-hidden
                "
                disabled={!isConnected || isUploading}
              />
              <button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && !selectedFile) || !isConnected || isUploading}
                className="bg-primary text-white px-3 py-2 rounded-full font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsChipDialogOpen(true)}
              className="w-full bg-gradient-to-br from-primary via-secondary to-primary border-2 border-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LockKeyhole className="w-5 h-5 text-primary-foreground" />
              メッセージルームが解放されていません
            </button>
          )}
        </div>
      </div>

      {/* チップ送信ダイアログ */}
      {partnerUserId && (
        <ChipPaymentDialog
          isOpen={isChipDialogOpen}
          onClose={() => setIsChipDialogOpen(false)}
          recipientUserId={partnerUserId}
          recipientName={partnerName}
          recipientAvatar={partnerAvatar || undefined}
        />
      )}
    </div>
  );
}
