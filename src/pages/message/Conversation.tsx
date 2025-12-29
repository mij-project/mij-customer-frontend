import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

import { useConversationWebSocket } from '@/hooks/useConversationWebSocket';
import {
  getConversationMessages,
  sendConversationMessage,
  getMessageAssetUploadUrl,
  markMessageAsRead,
} from '@/api/endpoints/conversation';
import { me } from '@/api/endpoints/auth';
import { MessageResponse } from '@/api/types/conversation';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
import { Button } from '@/components/ui/button';
import ChipPaymentDialog from '@/components/common/ChipPaymentDialog';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/providers/AuthContext';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { NG_WORDS } from '@/constants/ng_word';

type LocationState = { fromProfile?: boolean; profileUsername?: string } | null;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const VALID_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function Conversation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams<{ conversationId: string }>();

  const { messages: wsMessages, isConnected, error } = useConversationWebSocket(conversationId || '');
  const { user, isCreator } = useAuth();

  // ===== UI state =====
  const [isLoading, setIsLoading] = useState(true);
  const [allMessages, setAllMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [fileValidationError, setFileValidationError] = useState('');

  // ===== user/partner =====
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [partnerProfileUsername, setPartnerProfileUsername] = useState<string | null>(null);

  // ===== permissions =====
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [currentUserIsCreator, setCurrentUserIsCreator] = useState(false);
  const [partnerUserIsCreator, setPartnerUserIsCreator] = useState(false);
  const [isCurrentUserSeller, setIsCurrentUserSeller] = useState(false);
  const [isCurrentUserBuyer, setIsCurrentUserBuyer] = useState(false);
  const [hasChipHistoryToPartner, setHasChipHistoryToPartner] = useState(false);
  const [hasDmPlanToPartner, setHasDmPlanToPartner] = useState(false);

  // ===== chip modal =====
  const [isChipDialogOpen, setIsChipDialogOpen] = useState(false);

  // ===== chip animation =====
  const [animatingChipId, setAnimatingChipId] = useState<string | null>(null);

  // ===== image modal =====
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

  // ===== per-message video loading overlay =====
  const [videoLoadingStates, setVideoLoadingStates] = useState<Record<string, boolean>>({});

  // ===== file upload =====
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== layout refs =====
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [headerHeight, setHeaderHeight] = useState(64);
  const [errorHeight, setErrorHeight] = useState(0);

  // ===== scroll control =====
  const hasInitialScrollRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const threshold = 80; // px
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < threshold;
  }, []);

  // ===== time/date helpers =====
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const getJSTDateKey = useCallback((date: Date) => {
    // YYYY/MM/DD in Asia/Tokyo
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }, []);

  const formatDate = useCallback(
    (timestamp: string) => {
      const messageDate = new Date(timestamp);
      const now = new Date();

      const messageKey = getJSTDateKey(messageDate);
      const todayKey = getJSTDateKey(now);
      const yesterdayKey = getJSTDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));

      if (messageKey === todayKey) return '今日';
      if (messageKey === yesterdayKey) return '昨日';

      const parts = new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        month: 'numeric',
        day: 'numeric',
        weekday: 'narrow',
      }).formatToParts(messageDate);

      const month = parts.find((p) => p.type === 'month')?.value || '';
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const weekday = parts.find((p) => p.type === 'weekday')?.value || '';

      return `${month}/${day}(${weekday})`;
    },
    [getJSTDateKey]
  );

  const isSameJSTDate = useCallback(
    (ts1: string, ts2: string) => {
      return getJSTDateKey(new Date(ts1)) === getJSTDateKey(new Date(ts2));
    },
    [getJSTDateKey]
  );

  // ===== NG word check =====
  const checkNGWords = useCallback((text: string): string => {
    const found = NG_WORDS.filter((w) => text.toLowerCase().includes(w.toLowerCase()));
    return found.length > 0 ? `禁止ワードが含まれています: ${found.join(', ')}` : '';
  }, []);

  // ===== textarea auto resize =====
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

  // ===== header height observer =====
  useEffect(() => {
    const update = () => {
      if (!headerRef.current) return;
      setHeaderHeight(headerRef.current.offsetHeight);
    };

    update();

    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);

    return () => ro.disconnect();
  }, []);

  // ===== error height observer =====
  useEffect(() => {
    const update = () => {
      if (!errorRef.current) return setErrorHeight(0);
      setErrorHeight(errorRef.current.offsetHeight);
    };

    update();

    const ro = new ResizeObserver(update);
    if (errorRef.current) ro.observe(errorRef.current);

    return () => ro.disconnect();
  }, [error]);

  // ===== initial fetch =====
  useEffect(() => {
    const fetchInitial = async () => {
      if (!conversationId) {
        navigate('/message');
        return;
      }

      setIsLoading(true);

      try {
        const meResp = await me();
        setCurrentUserId(meResp.data.id);

        const messagesResp = await getConversationMessages(conversationId, 0, 50);
        const messages = messagesResp.data.messages || [];
        setAllMessages(messages);

        setCanSendMessage(!!messagesResp.data.can_send_message);
        setCurrentUserIsCreator(!!messagesResp.data.current_user_is_creator);
        setPartnerUserIsCreator(!!messagesResp.data.partner_user_is_creator);
        setIsCurrentUserSeller(!!messagesResp.data.is_current_user_seller);
        setIsCurrentUserBuyer(!!messagesResp.data.is_current_user_buyer);
        setHasChipHistoryToPartner(!!messagesResp.data.has_chip_history_to_partner);
        setHasDmPlanToPartner(!!messagesResp.data.has_dm_plan_to_partner);

        if (messagesResp.data.partner_profile_name) setPartnerName(messagesResp.data.partner_profile_name);
        if (messagesResp.data.partner_avatar) setPartnerAvatar(messagesResp.data.partner_avatar);
        if (messagesResp.data.partner_user_id) setPartnerUserId(messagesResp.data.partner_user_id);
        if (messagesResp.data.partner_profile_username) setPartnerProfileUsername(messagesResp.data.partner_profile_username);

        // mark latest as read (ignore failure)
        if (messages.length > 0) {
          const latest = messages[messages.length - 1];
          markMessageAsRead(conversationId, latest.id).catch((e: any) => {
            console.error('[既読処理] 失敗:', {
              error: e?.message,
              response: e?.response?.data,
              status: e?.response?.status,
            });
          });
        }
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [conversationId, navigate]);

  // ===== initial scroll (always bottom when opening) =====
  useEffect(() => {
    if (isLoading) return;
    if (hasInitialScrollRef.current) return;

    requestAnimationFrame(() => {
      scrollToBottom('auto');
      hasInitialScrollRef.current = true;
      shouldAutoScrollRef.current = true; // opening state = bottom
    });
  }, [isLoading, allMessages.length, scrollToBottom]);

  // ===== websocket new messages -> merge + mark read =====
  useEffect(() => {
    if (!wsMessages || wsMessages.length === 0) return;

    setAllMessages((prev) => {
      const newOnes = wsMessages.filter((w) => !prev.some((m) => m.id === w.id));
      if (newOnes.length === 0) return prev;

      const next = [...prev, ...newOnes];

      if (conversationId) {
        const latest = next[next.length - 1];
        markMessageAsRead(conversationId, latest.id).catch((e: any) => {
          console.error('[既読処理] WebSocket新着メッセージの既読処理に失敗:', {
            error: e?.message,
            response: e?.response?.data,
            status: e?.response?.status,
          });
        });
      }

      return next;
    });
  }, [wsMessages, conversationId]);

  // ===== auto scroll when messages change (only if near bottom) =====
  useEffect(() => {
    if (!hasInitialScrollRef.current) return;
    if (!shouldAutoScrollRef.current) return;

    requestAnimationFrame(() => scrollToBottom('auto'));
  }, [allMessages.length, scrollToBottom]);

  // ===== cleanup preview URL =====
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== file handlers =====
  const handleCancelFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setFileValidationError('');

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    const isValid = VALID_IMAGE_TYPES.includes(file.type) || VALID_VIDEO_TYPES.includes(file.type);
    if (!isValid) {
      setFileValidationError('画像（JPEG, PNG, GIF, WebP）または動画（MP4, MOV）のみアップロード可能です');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileValidationError('ファイルサイズは500MB以下にしてください');
      return;
    }

    setFileValidationError('');
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // ===== send message =====
  const handleSendMessage = useCallback(async () => {
    if (!conversationId) return;
    if (!inputText.trim() && !selectedFile) return;
    if (validationError) return;

    try {
      setIsUploading(true);

      let assetStorageKey: string | null = null;
      let assetType: number | null = null; // 1=image, 2=video

      if (selectedFile) {
        const fileExtension = selectedFile.name.split('.').pop() || '';
        const isImage = selectedFile.type.startsWith('image/');
        assetType = isImage ? 1 : 2;

        const uploadUrlResp = await getMessageAssetUploadUrl(conversationId, {
          asset_type: assetType,
          content_type: selectedFile.type,
          file_extension: fileExtension,
        });

        setUploadProgress(0);

        await putToPresignedUrl(
          {
            key: uploadUrlResp.data.storage_key,
            upload_url: uploadUrlResp.data.upload_url,
            expires_in: uploadUrlResp.data.expires_in,
            required_headers: uploadUrlResp.data.required_headers,
          },
          selectedFile,
          uploadUrlResp.data.required_headers,
          {
            onProgress: (progress) => {
              setUploadProgress(Math.round(progress * 100));
            },
          }
        );

        assetStorageKey = uploadUrlResp.data.storage_key;
        setUploadProgress(100);
      }

      const messageResp = await sendConversationMessage(conversationId, {
        body_text: inputText.trim() || null,
        asset_storage_key: assetStorageKey,
        asset_type: assetType,
      });

      setAllMessages((prev) => [...prev, messageResp.data]);

      // mark my message as read (ignore failure)
      markMessageAsRead(conversationId, messageResp.data.id).catch((e) => {
        console.error('[既読処理] 送信メッセージの既読処理に失敗:', e);
      });

      setInputText('');
      setValidationError('');
      handleCancelFile();

      // force scroll bottom for my send
      shouldAutoScrollRef.current = true;
      requestAnimationFrame(() => scrollToBottom('auto'));
    } catch (e) {
      console.error('Failed to send message:', e);
      alert('メッセージの送信に失敗しました');
    } finally {
      setIsUploading(false);
    }
  }, [
    conversationId,
    inputText,
    selectedFile,
    validationError,
    handleCancelFile,
    scrollToBottom,
  ]);

  // ===== keyboard send =====
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // ===== chip click animation =====
  const handleChipClick = useCallback((messageId: string) => {
    setAnimatingChipId(messageId);
    window.setTimeout(() => setAnimatingChipId(null), 1000);
  }, []);

  // ===== back navigation =====
  const handleBack = useCallback(() => {
    const state = location.state as LocationState;
    if (state?.fromProfile && state?.profileUsername) {
      navigate(`/profile?username=${state.profileUsername}`);
      return;
    }
    navigate(-1);
  }, [location.state, navigate]);

  // ===== input mode (render logic) =====
  const inputMode = useMemo(() => {
    // Pattern 1: normal <-> normal => no input
    if (!currentUserIsCreator && !partnerUserIsCreator) return 'hidden';

    // Pattern 2: creator <-> normal
    const isCreatorVsNormal =
      (currentUserIsCreator && !partnerUserIsCreator) || (!currentUserIsCreator && partnerUserIsCreator);

    if (isCreatorVsNormal) {
      if (currentUserIsCreator && !partnerUserIsCreator) return 'creator_free'; // creator -> normal
      // normal -> creator
      if (!canSendMessage) return 'locked';
      return 'user_to_creator';
    }

    // Pattern 3: creator <-> creator
    if (currentUserIsCreator && partnerUserIsCreator) {
      if (isCurrentUserSeller) return 'creator_creator_free';
      if (isCurrentUserBuyer) return 'creator_creator_free';
      return 'locked';
    }

    return 'hidden';
  }, [
    canSendMessage,
    currentUserIsCreator,
    partnerUserIsCreator,
    isCurrentUserSeller,
    isCurrentUserBuyer,
  ]);

  const canAttach = useMemo(() => {
    // only when we show file icon in UI
    return inputMode === 'creator_free' || inputMode === 'creator_creator_free';
  }, [inputMode]);

  const showChipButton = useMemo(() => {
    return inputMode === 'user_to_creator' || inputMode === 'creator_creator_free';
  }, [inputMode]);

  const showInput = useMemo(() => {
    return inputMode === 'creator_free' || inputMode === 'user_to_creator' || inputMode === 'creator_creator_free';
  }, [inputMode]);

  const lockedButton = useMemo(() => {
    return inputMode === 'locked';
  }, [inputMode]);

  const isSendDisabled = useMemo(() => {
    return (
      (!inputText.trim() && !selectedFile) ||
      !isConnected ||
      isUploading ||
      validationError !== ''
    );
  }, [inputText, selectedFile, isConnected, isUploading, validationError]);

  // ===== loading screen =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10"
      >
        <Button variant="ghost" size="sm" onClick={handleBack} className="w-10 flex justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div
          className="flex items-center flex-1 justify-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            if (partnerProfileUsername) navigate(`/profile?username=${partnerProfileUsername}`);
          }}
        >
          <img
            src={partnerAvatar || require('@/assets/no-image.svg').default || ''}
            alt={partnerName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="text-xl font-semibold">{partnerName || '会話'}</h1>
        </div>

        <div className="w-10" />
      </div>

      {/* Error banner */}
      {error && (
        <div
          ref={errorRef}
          className="fixed left-0 right-0 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm"
          style={{ top: `${headerHeight}px` }}
        >
          {error}
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
        style={{ paddingTop: `${headerHeight + errorHeight + 16}px` }}
      >
        {allMessages.map((message, index) => {
          const isCurrentUser = !!currentUserId && message.sender_user_id === currentUserId;

          const showDateSeparator =
            index === 0 || !isSameJSTDate(message.updated_at, allMessages[index - 1].updated_at);

          const timeLabel = formatTimestamp(convertDatetimeToLocalTimezone(message.updated_at));

          const renderTime = (align: 'left' | 'right') => (
            <div className="text-xs text-gray-400 whitespace-nowrap mb-1">{timeLabel}</div>
          );

          const renderAsset = () => {
            if (!message.asset) return null;

            const dimClass = message.asset.status === 0 ? 'opacity-50' : '';

            // approved + cdn_url
            if (message.asset.status === 1 && message.asset.cdn_url) {
              if (message.asset.asset_type === 1) {
                return (
                  <img
                    src={message.asset.cdn_url}
                    className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setExpandedImageUrl(message.asset.cdn_url)}
                    onLoad={() => {
                      // if user is at bottom, keep it bottom after image expands
                      if (shouldAutoScrollRef.current) requestAnimationFrame(() => scrollToBottom('auto'));
                    }}
                    alt="Message image"
                  />
                );
              }

              return (
                <div className="relative">
                  {videoLoadingStates[message.id] && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                      <span className="text-white text-sm">動画読み込み中</span>
                    </div>
                  )}
                  <video
                    src={message.asset.cdn_url}
                    controls
                    className="max-w-xs rounded-lg"
                    onLoadStart={() => {
                      setVideoLoadingStates((prev) => ({ ...prev, [message.id]: true }));
                    }}
                    onCanPlay={() => {
                      setVideoLoadingStates((prev) => ({ ...prev, [message.id]: false }));
                      if (shouldAutoScrollRef.current) requestAnimationFrame(() => scrollToBottom('auto'));
                    }}
                    onError={() => {
                      setVideoLoadingStates((prev) => ({ ...prev, [message.id]: false }));
                    }}
                  />
                </div>
              );
            }

            // pending/rejected/etc
            const statusText =
              message.asset.status === 0
                ? '審査待ち'
                : message.asset.status === 2
                  ? '拒否'
                  : message.asset.status === 3
                    ? '再申請'
                    : '審査中';

            return (
              <div className={`${dimClass}`}>
                <div className="bg-gray-200 rounded-lg max-w-md p-20">
                  <div className="flex items-center gap-2 text-gray-600">
                    {message.asset.asset_type === 1 ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : (
                      <Video className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{statusText}</span>
                  </div>
                </div>
              </div>
            );
          };

          const renderTextBubble = () => {
            if (!message.body_text) return null;

            return (
              <div
                className={`w-fit max-w-[80vw] sm:max-w-md px-4 py-2 rounded-2xl ${
                  isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-900'
                }`}
              >
                <p className="break-words whitespace-pre-wrap">{message.body_text}</p>
              </div>
            );
          };

          const renderChip = () => (
            <div onClick={() => handleChipClick(message.id)} className="relative cursor-pointer">
              <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-300 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">チップ</span>
                </div>
                <p className="break-words whitespace-pre-wrap text-gray-800 font-medium">{message.body_text}</p>
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
          );

          const hasText = !!message.body_text;
          const hasAsset = !!message.asset;

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {formatDate(message.updated_at)}
                  </div>
                </div>
              )}

              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[95%]`}
                >
                  {/* Avatar (partner only) */}
                  {!isCurrentUser && (
                    <img
                      src={partnerAvatar || require('@/assets/no-image.svg').default || ''}
                      alt={partnerName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (partnerProfileUsername) navigate(`/profile?username=${partnerProfileUsername}`);
                      }}
                    />
                  )}

                  <div className={isCurrentUser ? 'flex flex-col items-end' : 'flex-1'}>
                    {!isCurrentUser && (
                      <div
                        className="text-md text-gray-500 mb-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          if (partnerProfileUsername) navigate(`/profile?username=${partnerProfileUsername}`);
                        }}
                      >
                        {partnerName}
                      </div>
                    )}

                    {/* line: bubble + time */}
                    <div className={`flex items-end gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* time on left for current user */}
                      {isCurrentUser && renderTime('left')}

                      {/* content */}
                      {message.type === 2 ? (
                        renderChip()
                      ) : hasText ? (
                        renderTextBubble()
                      ) : hasAsset ? (
                        renderAsset()
                      ) : null}

                      {/* time on right for partner */}
                      {!isCurrentUser && renderTime('right')}
                    </div>

                    {/* if both text and asset: asset on new line */}
                    {message.type !== 2 && hasText && hasAsset && (
                      <div className="mt-2">{renderAsset()}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4"
        onDragOver={canAttach ? handleDragOver : undefined}
        onDragLeave={canAttach ? handleDragLeave : undefined}
        onDrop={canAttach ? handleDrop : undefined}
      >
        {/* drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-20">
            <div className="text-primary font-semibold">ファイルをドロップ</div>
          </div>
        )}

        {/* file preview */}
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
          </div>
        )}

        {/* upload progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>{uploadProgress === 100 ? 'アップロード完了' : 'アップロード中...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  uploadProgress === 100 ? 'bg-green-500' : 'bg-primary'
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* validation errors */}
        {validationError && (
          <div className="mb-3">
            <ErrorMessage message={validationError} variant="warning" />
          </div>
        )}
        {fileValidationError && (
          <div className="mb-3">
            <ErrorMessage message={fileValidationError} variant="error" />
          </div>
        )}

        {/* input row */}
        <div className="flex items-end space-x-2">
          {inputMode === 'hidden' ? null : lockedButton ? (
            <button
              onClick={() => setIsChipDialogOpen(true)}
              className="w-full bg-gradient-to-br from-primary via-secondary to-primary border-2 border-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <LockKeyhole className="w-5 h-5 text-primary-foreground" />
              メッセージルームが解放されていません
            </button>
          ) : (
            <>
              {/* file attach */}
              {canAttach && (
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

              {/* chip button */}
              {showChipButton && (
                <button
                  onClick={() => setIsChipDialogOpen(true)}
                  disabled={!isConnected || isUploading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="チップを送る"
                >
                  <Gift className="w-5 h-5" />
                </button>
              )}

              {/* textarea */}
              {showInput && (
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputText(value);
                    setValidationError(checkNGWords(value));
                  }}
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
              )}

              {/* send */}
              {showInput && (
                <button
                  onClick={handleSendMessage}
                  disabled={isSendDisabled}
                  className="bg-primary text-white px-3 py-2 rounded-full font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chip dialog */}
      {partnerUserId && (
        <ChipPaymentDialog
          isOpen={isChipDialogOpen}
          onClose={() => setIsChipDialogOpen(false)}
          recipientUserId={partnerUserId}
          recipientName={partnerName}
          recipientAvatar={partnerAvatar || undefined}
          has_sent_chip={hasChipHistoryToPartner}
          has_dm_release_plan={hasDmPlanToPartner}
        />
      )}

      {/* Image modal */}
      {expandedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandedImageUrl(null)}
        >
          <button
            onClick={() => setExpandedImageUrl(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={expandedImageUrl}
            alt="Expanded image"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
