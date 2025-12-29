// react要素をインポート
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getGenres,
  getCategories,
  getRecommendedCategories,
  getRecentCategories,
  Category,
  Genre,
} from '@/api/endpoints/categories';
import { useNavigate } from 'react-router-dom';
import ImageGalleryModal from '@/components/common/ImageGalleryModal';

// 型定義
import { PostData } from '@/api/types/postMedia';
import { CreatePostRequest } from '@/api/types/post';
import {
  SHARE_VIDEO_CONSTANTS,
  SHARE_VIDEO_VALIDATION_MESSAGES,
} from '@/features/shareVideo/constans/constans';
import { PostFileKind } from '@/constants/constants';

import CommonLayout from '@/components/layout/CommonLayout';

// セクションコンポーネントをインポート
import MainVideoSection from '@/features/shareVideo/section/MainVideoSection';
import SampleVideoSection from '@/features/shareVideo/section/SampleVideoSection';
import OgpImageSection from '@/features/shareVideo/section/OgpImageSection';
import ImagePostSection from '@/features/shareVideo/section/ImagePostSection';
import ThumbnailSection from '@/features/shareVideo/section/ThumbnailSection';
import DescriptionSection from '@/features/shareVideo/section/DescriptionSection';
import CategorySection from '@/features/shareVideo/section/CategorySection';
import TagsSection from '@/features/shareVideo/section/TagsSection';
import SettingsSection from '@/features/shareVideo/section/SettingsSection';
import ConfirmationSection from '@/features/shareVideo/section/ConfirmationSection';
import FooterSection from '@/features/shareVideo/section/FooterSection';

// ユーティリティ
import { formatDateTime, formatTime } from '@/lib/datetime';
import { mimeToImageExt, mimeToExt } from '@/lib/media';

// コンポーネントをインポート
import { Button } from '@/components/ui/button';
import { FileSpec, VideoFileSpec } from '@/api/types/commons';
import { PostImagePresignedUrlRequest, PostVideoPresignedUrlRequest } from '@/api/types/postMedia';
import {
  postImagePresignedUrl,
  postVideoPresignedUrl,
  triggerBatchProcess,
} from '@/api/endpoints/postMedia';
import { generateMediaPresignedUrl } from '@/api/endpoints/generation_media';

// エンドポイントをインポート
import { createPost, deletePost } from '@/api/endpoints/post';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { ErrorMessage } from '@/components/common';
import { uploadTempMainVideo, getTempVideoPlaybackUrl } from '@/api/endpoints/videoTemp';
import VideoTrimModal from '@/features/shareVideo/componets/VideoTrimModal';
import { UploadProgressModal } from '@/components/common/UploadProgressModal';
import { convertLocalJSTToUTC } from '@/utils/convertDatetimeToLocalTimezone';
import { ArrowLeft } from 'lucide-react';
import PrePostMessageModal from '@/features/shareVideo/componets/PrePostMessageModal';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/providers/AuthContext';
import CreatorRequestDialog from '@/components/common/CreatorRequestDialog';

import { UserRole } from '@/utils/userRole';
import { classifyResolution, getVideoMetadata } from '@/utils/videoFileMetadata';

type Orientation = 'portrait' | 'landscape' | 'square';

export default function ShareVideo() {
  const navigate = useNavigate();
  const { user, reload } = useAuth();

  const [isThumbnailManual, setIsThumbnailManual] = useState(false);
  const [error, setError] = useState({ show: false, messages: [] as string[] });
  const [postType, setPostType] = useState<'video' | 'image'>('video');
  const [showCreatorRequestDialog, setShowCreatorRequestDialog] = useState(false);
  const [showPrePostMessageModal, setShowPrePostMessageModal] = useState(true);

  // メイン動画関連の状態
  const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
  const [previewMainUrl, setPreviewMainUrl] = useState<string | null>(null);

  // サンプル動画関連の状態
  const [selectedSampleFile, setSelectedSampleFile] = useState<File | null>(null);
  const [previewSampleUrl, setPreviewSampleUrl] = useState<string | null>(null);
  const [sampleDuration, setSampleDuration] = useState<string | null>(null);
  const [sampleStartTime, setSampleStartTime] = useState<number>(0);
  const [sampleEndTime, setSampleEndTime] = useState<number>(0);
  const [tempVideoS3Key, setTempVideoS3Key] = useState<string | null>(null);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [isUploadingMainVideo, setIsUploadingMainVideo] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState<number>(0);

  // 画像関連の状態
  const [ogp, setOgp] = useState<string | null>(null);
  const [ogpPreview, setOgpPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // ✅ preview urls for selectedImages (avoid repeated createObjectURL)
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  useEffect(() => {
    const urls = selectedImages.map((f) => URL.createObjectURL(f));
    setImagePreviewUrls(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [selectedImages]);

  // 動画設定の状態
  const [isSample, setIsSample] = useState<'upload' | 'cut_out'>('upload');

  // トグルスイッチの状態
  const [scheduled, setScheduled] = useState(false);
  const [expiration, setExpiration] = useState(false);
  const [plan, setPlan] = useState(false);
  const [single, setSingle] = useState(false);

  // 確認項目の状態
  const [checks, setChecks] = useState({
    confirm1: false,
    confirm2: false,
    confirm3: false,
    confirm4: false,
  });

  // プラン選択の状態
  const [selectedPlanId, setSelectedPlanId] = useState<string[]>([]);
  const [selectedPlanName, setSelectedPlanName] = useState<string[]>([]);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  // カテゴリー関連の状態
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [recommendedCategories, setRecommendedCategories] = useState<Category[]>([]);
  const [recentCategories, setRecentCategories] = useState<Category[]>([]);
  const [expandedGenres, setExpandedGenres] = useState<string[]>([]);

  // カテゴリー選択用の状態（最大5つ）
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 動画アップロード処理の状態
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<PostFileKind, number>>({
    main: 0,
    sample: 0,
    ogp: 0,
    thumbnail: 0,
    images: 0,
  });
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState<number>(0);

  // 画像ギャラリーモーダル用の状態
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasNgWords, setHasNgWords] = useState(false);

  // ページ読み込み時に最新のユーザー情報を取得
  useEffect(() => {
    reload();
  }, []);

  // =========================
  // ✅ getAspectRatio (timeout + cache + cleanup)
  // =========================
  const aspectCacheRef = useRef<Map<string, Orientation>>(new Map());
  const inflightRef = useRef<Map<string, Promise<Orientation>>>(new Map());

  const calcOrientation = (w: number, h: number): Orientation => {
    const r = w / h;
    if (r > 1.1) return 'landscape';
    if (r < 0.9) return 'portrait';
    return 'square';
  };

  const fileKey = (f: File) => `${f.name}_${f.size}_${f.lastModified}_${f.type}`;

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('timeout')), timeoutMs);
      promise.then(
        (v) => {
          window.clearTimeout(t);
          resolve(v);
        },
        (e) => {
          window.clearTimeout(t);
          reject(e);
        }
      );
    });
  };

  const getVideoOrientation = (
    file: File,
    timeoutMs: number,
    cacheKey: string
  ): Promise<Orientation> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      let done = false;

      const cleanup = () => {
        try {
          video.pause();
        } catch {}
        try {
          video.removeAttribute('src');
          video.load();
        } catch {}
        try {
          URL.revokeObjectURL(url);
        } catch {}
      };

      const finish = (o: Orientation) => {
        if (done) return;
        done = true;
        cleanup();
        aspectCacheRef.current.set(cacheKey, o);
        resolve(o);
      };

      const timer = window.setTimeout(() => finish('square'), timeoutMs);

      video.onloadedmetadata = () => {
        window.clearTimeout(timer);
        const w = video.videoWidth || 1;
        const h = video.videoHeight || 1;
        finish(calcOrientation(w, h));
      };

      video.onerror = () => {
        window.clearTimeout(timer);
        finish('square');
      };

      video.src = url;
    });
  };

  const getAspectRatio = (file: File, timeoutMs = 4000): Promise<Orientation> => {
    const key = fileKey(file);

    const cached = aspectCacheRef.current.get(key);
    if (cached) return Promise.resolve(cached);

    const inflight = inflightRef.current.get(key);
    if (inflight) return inflight;

    const p = (async (): Promise<Orientation> => {
      if (file.type.startsWith('image/')) {
        try {
          const bmp = await withTimeout(createImageBitmap(file), timeoutMs);
          const o = calcOrientation(bmp.width, bmp.height);
          bmp.close();
          aspectCacheRef.current.set(key, o);
          return o;
        } catch {
          aspectCacheRef.current.set(key, 'square');
          return 'square';
        }
      }

      if (file.type.startsWith('video/')) {
        return await getVideoOrientation(file, timeoutMs, key);
      }

      aspectCacheRef.current.set(key, 'square');
      return 'square';
    })();

    inflightRef.current.set(key, p);
    p.finally(() => inflightRef.current.delete(key));

    return p;
  };

  // =========================
  // フォームデータの状態管理
  // =========================
  const [formData, setFormData] = useState<
    PostData & { singlePrice?: string; orientation?: Orientation }
  >({
    description: '',
    genres: [],
    tags: '',
    scheduled: false,
    scheduledDate: new Date(),
    scheduledTime: '',
    formattedScheduledDateTime: '',
    expiration: false,
    expirationDate: new Date(),
    plan: false,
    plan_ids: [],
    single: false,
    singlePrice: '',
  });

  // カテゴリー取得処理
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresData, categoriesData, recommendedData] = await Promise.all([
          getGenres(),
          getCategories(),
          getRecommendedCategories(),
        ]);
        setGenres(genresData);
        setCategories(categoriesData);
        setRecommendedCategories(recommendedData);

        try {
          const recentData = await getRecentCategories();
          setRecentCategories(recentData);
        } catch (error) {
          setRecentCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories data:', error);
      }
    };
    fetchData();
  }, []);

  // サムネイル生成（Fileオブジェクトから直接生成してCORS問題を回避）
  useEffect(() => {
    if (!selectedMainFile || !(selectedMainFile instanceof File)) {
      return;
    }

    if (isThumbnailManual) {
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;

    let blobUrl: string | null = null;

    const generateThumbnail = () => {
      try {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const maxWidth = SHARE_VIDEO_CONSTANTS.THUMBNAIL_WIDTH;
        const maxHeight = SHARE_VIDEO_CONSTANTS.THUMBNAIL_MAX_HEIGHT;

        let canvasWidth: number;
        let canvasHeight: number;

        const aspectRatio = videoWidth / videoHeight;
        if (aspectRatio > maxWidth / maxHeight) {
          canvasWidth = maxWidth;
          canvasHeight = Math.round(maxWidth / aspectRatio);
        } else {
          canvasHeight = maxHeight;
          canvasWidth = Math.round(maxHeight * aspectRatio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setThumbnail(thumbnailDataUrl);
        }
      } catch (error) {
        console.error('❌ サムネイル描画エラー:', error);
      } finally {
        cleanup();
      }
    };

    const cleanup = () => {
      try {
        video.pause();
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          blobUrl = null;
        }
        video.removeAttribute('src');
        video.load();
        video.remove();
      } catch (error) {
        console.warn('cleanup エラー（無視）:', error);
      }
    };

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      const err = videoElement.error;

      if (err) {
        console.error('動画読み込みエラー詳細:', {
          code: err.code,
          message: err.message,
          MEDIA_ERR_ABORTED: err.code === 1,
          MEDIA_ERR_NETWORK: err.code === 2,
          MEDIA_ERR_DECODE: err.code === 3,
          MEDIA_ERR_SRC_NOT_SUPPORTED: err.code === 4,
          videoSrc: videoElement.src,
          fileType: selectedMainFile?.type,
          fileSize: selectedMainFile?.size,
        });
      }

      console.warn('サムネイル生成をスキップ（動画読み込みエラー）');
      cleanup();
    };

    const handleLoadedMetadata = () => {
      try {
        video.currentTime = Math.min(1, video.duration * 0.1);
      } catch (error) {
        console.error('seek エラー:', error);
        cleanup();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', generateThumbnail, { once: true });
    video.addEventListener('error', handleError);

    try {
      blobUrl = URL.createObjectURL(selectedMainFile);
      video.src = blobUrl;
      video.load();
    } catch (error) {
      console.error('Blob URL作成エラー:', error);
      cleanup();
    }

    return cleanup;
  }, [selectedMainFile, isThumbnailManual]);

  // 日時更新処理の共通化
  const updateScheduledDateTime = (date?: Date, time?: string) => {
    if (date) {
      setFormData((prev) => ({ ...prev, scheduledDate: date }));
    }
    if (time !== undefined) {
      updateFormData('scheduledTime', time);
    }

    const currentDate = date || formData.scheduledDate;
    const currentTime = time !== undefined ? time : formData.scheduledTime;

    if (currentDate && currentTime) {
      const formattedDateTime = formatDateTime(currentDate, currentTime);
      updateFormData('formattedScheduledDateTime', formattedDateTime);
    }
  };

  // 時間選択処理の共通化
  const handleTimeSelection = (value: string, isHour: boolean) => {
    let finalTime: string;

    if (isHour) {
      finalTime = `${value}:00`;
    } else {
      const currentHour = formData.scheduledTime ? formData.scheduledTime.split(':')[0] : '00';
      finalTime = `${currentHour}:${value}`;
    }

    updateScheduledDateTime(undefined, finalTime);
  };

  // ファイル処理の共通化（動画以外）
  const handleFileChange = async (file: File | null, fileType: PostFileKind) => {
    if (!file) return;

    switch (fileType) {
      case 'sample':
        setSelectedSampleFile(file);
        break;
      case 'ogp':
        setOgp((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        break;
      case 'thumbnail': {
        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result as string;
          setThumbnail(imageUrl);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // ファイル削除処理の共通化
  const removeFile = (fileType: PostFileKind) => {
    switch (fileType) {
      case 'main':
        setSelectedMainFile(null);
        setPreviewMainUrl('');
        setThumbnail(null);
        setTempVideoS3Key(null);
        break;
      case 'sample':
        setSelectedSampleFile(null);
        if (previewSampleUrl && previewSampleUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewSampleUrl);
        }
        setPreviewSampleUrl('');
        setSampleStartTime(0);
        setSampleEndTime(0);
        setSampleDuration(null);
        break;
      case 'ogp':
        if (ogp && ogp.startsWith('blob:')) URL.revokeObjectURL(ogp);
        setOgp(null);
        break;
      case 'thumbnail':
        setThumbnail(null);
        setIsThumbnailManual(false);
        break;
    }
  };

  // 既存のファイル処理関数を保持（互換性のため）
  const handleMainVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > SHARE_VIDEO_CONSTANTS.MAX_FILE_SIZE) {
      setError({ show: true, messages: [SHARE_VIDEO_VALIDATION_MESSAGES.FILE_SIZE_ERROR] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUploadMessage('');
    setError({ show: false, messages: [] });

    setIsUploadingMainVideo(true);
    setUploadingProgress(0);
    try {
      setUploadMessage('動画をS3にアップロード中...');
      const response = await uploadTempMainVideo(file, (progress) => {
        setUploadingProgress(progress);
      });

      setTempVideoS3Key(response.s3_key);

      setSelectedMainFile(file);

      setUploadMessage('動画の再生URLを取得中...');
      const playbackData = await getTempVideoPlaybackUrl(response.s3_key);
      setPreviewMainUrl(playbackData.playback_url);

      setUploadMessage('');
    } catch (error) {
      console.error('一時動画アップロードエラー:', error);
      setError({ show: true, messages: ['動画のアップロードに失敗しました'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSelectedMainFile(null);
      setPreviewMainUrl('');
      setTempVideoS3Key(null);
    } finally {
      setIsUploadingMainVideo(false);
      setUploadingProgress(0);
    }
  };

  const handleSampleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError({ show: false, messages: [] });
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      setError({
        show: true,
        messages: [SHARE_VIDEO_VALIDATION_MESSAGES.SAMPLE_VIDEO_SIZE_ERROR],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    handleFileChange(file, 'sample');

    if (previewSampleUrl && previewSampleUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewSampleUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewSampleUrl(url);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const durationInSeconds = video.duration;

      if (durationInSeconds > SHARE_VIDEO_CONSTANTS.MAX_SAMPLE_VIDEO_DURATION) {
        setError({
          show: true,
          messages: [SHARE_VIDEO_VALIDATION_MESSAGES.SAMPLE_VIDEO_DURATION_ERROR],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedSampleFile(null);
        URL.revokeObjectURL(url);
        setPreviewSampleUrl('');
        return;
      }

      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      setSampleDuration(formatTime(minutes, seconds));
    };
  };

  const handleOgpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file, 'ogp');
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      setThumbnail(imageUrl);
      setIsThumbnailManual(true);
    };
    reader.readAsDataURL(file);
  };

  const allChecked = Object.values(checks).every(Boolean);

  const removeVideo = () => {
    setIsThumbnailManual(false);
    removeFile('main');
    setError({ show: false, messages: [] });
  };

  const removeSampleVideo = () => {
    removeFile('sample');
    setError({ show: false, messages: [] });
  };

  const showCutOutModal = () => {
    if (!tempVideoS3Key || !previewMainUrl) {
      setError({ show: true, messages: ['本編動画を先にアップロードしてください'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowTrimModal(true);
  };

  const handleTrimComplete = (startTime: number, endTime: number) => {
    setSampleStartTime(startTime);
    setSampleEndTime(endTime);
    setPreviewSampleUrl(previewMainUrl);

    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    setSampleDuration(formatTime(minutes, seconds));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError({ show: false, messages: [] });
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    const totalImages = selectedImages.length + newImages.length;

    if (totalImages > 10) {
      setError({ show: true, messages: ['画像投稿は最大10枚です。'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      e.target.value = '';
      return;
    }

    setSelectedImages((prev) => [...prev, ...newImages]);

    if (selectedImages.length === 0 && newImages.length > 0) {
      try {
        const aspectRatio = await getAspectRatio(newImages[0]);
        setFormData((prev) => ({ ...prev, orientation: aspectRatio }));
      } catch (error) {
        console.error('アスペクト比の判定に失敗:', error);
      }
    }
  };

  const removeImage = (index: number) => {
    setError({ show: false, messages: [] });
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 画像ギャラリー用の配列（サムネイル、本編画像、OGP）
  const galleryImages = useMemo(() => {
    const urls: string[] = [];
    const pushUrl = (url?: string | null) => {
      if (url) urls.push(url);
    };

    if (postType === 'video') {
      pushUrl(thumbnail);
      pushUrl(ogp);
    } else {
      pushUrl(thumbnail);
      imagePreviewUrls.forEach((u) => pushUrl(u));
      pushUrl(ogp);
    }

    return urls;
  }, [postType, thumbnail, ogp, imagePreviewUrls]);

  // ✅ label without createObjectURL
  const getImageLabel = (index: number): string => {
    if (galleryImages.length === 0) return '';

    if (postType === 'video') {
      if (thumbnail && index === 0) return 'サムネイル';
      if (ogp && ((thumbnail && index === 1) || (!thumbnail && index === 0))) return 'OGP画像';
      return '';
    }

    let cursor = 0;

    if (thumbnail) {
      if (index === cursor) return 'サムネイル';
      cursor += 1;
    }

    const imgCount = imagePreviewUrls.length;
    if (index >= cursor && index < cursor + imgCount) {
      const i = index - cursor;
      return imgCount > 1 ? `本編画像 ${i + 1}` : '本編画像';
    }
    cursor += imgCount;

    if (ogp && index === cursor) return 'OGP画像';
    return '';
  };

  const handleImageClick = (index: number) => {
    if (galleryImages.length === 0) return;
    const safeIndex =
      ((index % galleryImages.length) + galleryImages.length) % galleryImages.length;
    setCurrentImageIndex(safeIndex);
    setShowImageGallery(true);
  };

  const openImageModal = (targetUrl?: string | null) => {
    if (!targetUrl || galleryImages.length === 0) return;
    const targetIndex = galleryImages.findIndex((url) => url === targetUrl);
    handleImageClick(targetIndex !== -1 ? targetIndex : 0);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      galleryImages.length === 0 ? prev : prev > 0 ? prev - 1 : galleryImages.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      galleryImages.length === 0 ? prev : prev < galleryImages.length - 1 ? prev + 1 : 0
    );
  };

  // トグルスイッチの状態変更処理
  const onToggleSwitch = (
    field: 'scheduled' | 'expiration' | 'plan' | 'single',
    value: boolean
  ) => {
    if (field === 'scheduled') setScheduled(value);
    if (field === 'expiration') setExpiration(value);
    if (field === 'plan') setPlan(value);
    if (field === 'single') setSingle(value);

    updateFormData(field, value);

    if (!value) {
      if (field === 'scheduled') {
        updateScheduledDateTime(new Date(), '');
      }
      if (field === 'expiration') {
        updateFormData('expirationDate', new Date());
      }
      if (field === 'plan') {
        updateFormData('plan_ids', []);
        setSelectedPlanId([]);
        setSelectedPlanName([]);
      }
      if (field === 'single') {
        updateFormData('singlePrice', '');
      }
    }
  };

  // フォームデータ更新関数
  const updateFormData = (field: keyof (PostData & { singlePrice?: string }), value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // カテゴリー選択処理（最大5つまで）
  const handleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const isAlreadySelected = prev.includes(categoryId);
      let newCategories: string[];

      if (isAlreadySelected) {
        newCategories = prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT) {
          setError({
            show: true,
            messages: [`カテゴリーは最大${SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT}つまで選択できます`],
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return prev;
        }
        newCategories = [...prev, categoryId];
      }

      updateFormData('genres', newCategories);
      return newCategories;
    });
  };

  const handleCategoryRemove = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.filter((id) => id !== categoryId);
      updateFormData('genres', newCategories);
      return newCategories;
    });
  };

  // 投稿データをまとめて送信
  const handleSubmitPost = async () => {
    const errorMessages = [] as string[];

    if (postType === 'video' && !selectedMainFile) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.MAIN_VIDEO_REQUIRED);
    }

    if (postType === 'video' && !selectedSampleFile && !previewSampleUrl) {
      errorMessages.push('サンプル動画を設定してください');
    }

    if (postType === 'image' && selectedImages.length === 0) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.IMAGE_REQUIRED);
    }

    if (postType === 'image' && !thumbnail) {
      errorMessages.push('サムネイルを設定してください');
    }

    if (!formData.description.trim()) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.DESCRIPTION_REQUIRED);
    }

    if (!allChecked) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.CONFIRMATION_REQUIRED);
    }

    if (formData.scheduled && !formData.formattedScheduledDateTime) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_DATETIME_REQUIRED);
    }

    if (formData.scheduled && formData.formattedScheduledDateTime) {
      const scheduledDateTime = new Date(formData.formattedScheduledDateTime);
      if (scheduledDateTime < new Date()) {
        errorMessages.push('過去の日時は設定できません');
      }
    }

    if (formData.expiration && !formData.expirationDate) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.EXPIRATION_DATE_REQUIRED);
    }

    if (
      (formData.scheduled && new Date(formData.formattedScheduledDateTime) <= new Date()) ||
      (formData.expiration && new Date(formData.expirationDate) <= new Date())
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_EXPIRATION_DATETIME_ERROR);
    }

    if (
      formData.scheduled &&
      formData.expiration &&
      new Date(formData.formattedScheduledDateTime) > new Date(formData.expirationDate)
    ) {
      errorMessages.push(
        SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_MORETHAN_EXPIRATION_DATETIME_ERROR
      );
    }

    if (!formData.single && !formData.plan) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_ERROR);
    }

    if (formData.plan && !formData.plan_ids) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_REQUIRED);
    }

    if (formData.single && !formData.singlePrice) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SINGLE_PRICE_REQUIRED);
    }

    if (
      formData.genres.length === 0 ||
      formData.genres.length > SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.CATEGORY_REQUIRED);
    }

    if (errorMessages.length > 0) {
      setError({ show: true, messages: errorMessages });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setOverallProgress(0);
    let createdPostId: string | null = null;

    try {
      setOverallProgress(10);
      const postData: CreatePostRequest = {
        ...formData,
        description: formData.description,
        category_ids: formData.genres,
        tags: formData.tags,
        scheduled: formData.scheduled,
        formattedScheduledDateTime: formData.formattedScheduledDateTime
          ? new Date(formData.formattedScheduledDateTime)
          : undefined,
        expiration: formData.expiration,
        expirationDate: formData.expirationDate,
        plan: formData.plan,
        plan_ids: formData.plan_ids,
        single: formData.single,
        price: formData.singlePrice ? Number(formData.singlePrice) : undefined,
        post_type: postType,
      };

      const response = await createPost(postData);
      createdPostId = response.id;
      setOverallProgress(20);

      const { imagePresignedUrl, videoPresignedUrl } = await getPresignedUrl(response.id);
      setOverallProgress(30);

      let totalFiles = 0;
      let uploadedFiles = 0;

      if (postType === 'video') {
        if (selectedMainFile) totalFiles++;
        if (selectedSampleFile || previewSampleUrl) totalFiles++;
        if (thumbnail) totalFiles++;
        if (ogp) totalFiles++;
      } else {
        totalFiles = selectedImages.length;
        if (thumbnail) totalFiles++;
        if (ogp) totalFiles++;
      }

      const uploadFile = async (file: File, kind: PostFileKind, presignedData: any) => {
        const header = presignedData.required_headers;

        await putToPresignedUrl(presignedData, file, header, {
          onProgress: (pct) => {
            setUploadProgress((prev) => ({ ...prev, [kind]: pct }));

            const baseProgress = 30;
            const uploadPhaseProgress = 70;
            const fileProgress = (uploadedFiles / totalFiles) * uploadPhaseProgress;
            const currentFileProgress = (pct / 100 / totalFiles) * uploadPhaseProgress;
            setOverallProgress(Math.min(99, baseProgress + fileProgress + currentFileProgress));
          },
        });
        uploadedFiles++;
      };

      if (postType === 'video') {
        if (selectedMainFile && tempVideoS3Key) {
          const mainOrientation = await getAspectRatio(selectedMainFile);

          let sampleOrientation: Orientation | undefined;
          if (isSample === 'upload' && selectedSampleFile) {
            sampleOrientation = await getAspectRatio(selectedSampleFile);
          } else if (isSample === 'cut_out') {
            sampleOrientation = mainOrientation;
          }

          await triggerBatchProcess({
            post_id: response.id,
            tmp_storage_key: tempVideoS3Key,
            need_trim: isSample === 'cut_out',
            start_time: isSample === 'cut_out' ? sampleStartTime : undefined,
            end_time: isSample === 'cut_out' ? sampleEndTime : undefined,
            main_orientation: mainOrientation,
            sample_orientation: sampleOrientation,
            content_type: selectedMainFile?.type as FileSpec['content_type'],
          });
        }

        if (selectedSampleFile && isSample === 'upload' && videoPresignedUrl.uploads?.sample) {
          await uploadFile(selectedSampleFile, 'sample', videoPresignedUrl.uploads.sample);
        }

        if (thumbnail && imagePresignedUrl.uploads?.thumbnail) {
          const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
          const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
          await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
        }

        if (ogp && imagePresignedUrl.uploads?.ogp) {
          const ogpBlob = await fetch(ogp).then((r) => r.blob());
          const ogpFile = new File([ogpBlob], 'ogp.jpg', { type: 'image/jpeg' });
          await uploadFile(ogpFile, 'ogp', imagePresignedUrl.uploads.ogp);
        } else {
          await generateMediaPresignedUrl(response.id);
        }
      } else if (postType === 'image') {
        if (selectedImages.length > 0 && imagePresignedUrl.uploads?.images) {
          const imageUploads = Array.isArray(imagePresignedUrl.uploads.images)
            ? imagePresignedUrl.uploads.images
            : [imagePresignedUrl.uploads.images];

          for (let i = 0; i < selectedImages.length && i < imageUploads.length; i++) {
            await uploadFile(selectedImages[i], 'images', imageUploads[i]);
          }

          // thumbnail upload (once)
          if (thumbnail && imagePresignedUrl.uploads?.thumbnail) {
            const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
            const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', {
              type: 'image/jpeg',
            });
            await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
          }

          // ogp upload (once)
          if (ogp && imagePresignedUrl.uploads?.ogp) {
            const ogpBlob = await fetch(ogp).then((r) => r.blob());
            const ogpFile = new File([ogpBlob], 'ogp.jpg', { type: 'image/jpeg' });
            await uploadFile(ogpFile, 'ogp', imagePresignedUrl.uploads.ogp);
          } else {
            await generateMediaPresignedUrl(response.id);
          }
        }
      }

      setOverallProgress(100);
      setUploadMessage(
        postType === 'video' ? '動画の投稿が完了しました！' : '画像の投稿が完了しました！'
      );

      setTimeout(() => {
        setUploading(false);
        navigate(`/account/post`);
      }, 1500);

      return;
    } catch (error) {
      console.error('投稿エラー:', error);
      if (createdPostId) {
        await deletePost(createdPostId);
      }
      setUploadMessage('投稿に失敗しました。時間をおいて再試行してください。');
      setError({ show: true, messages: ['投稿に失敗しました。時間をおいて再試行してください。'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setUploading(false);
    } finally {
      setUploadProgress({
        main: 0,
        sample: 0,
        ogp: 0,
        thumbnail: 0,
        images: 0,
      });
    }
  };

  // プレシジョンURLを取得
  const getPresignedUrl = async (postId: string) => {
    const imageFiles: any[] = [];

    if (thumbnail) {
      imageFiles.push({
        post_id: postId,
        kind: 'thumbnail' as const,
        content_type: 'image/jpeg' as FileSpec['content_type'],
        ext: 'jpg' as const,
        orientation: 'square' as const,
      });
    }

    if (ogp) {
      imageFiles.push({
        post_id: postId,
        kind: 'ogp' as const,
        content_type: 'image/jpeg' as FileSpec['content_type'],
        ext: 'jpg' as const,
        orientation: 'square' as const,
      });
    }

    if (postType === 'image' && selectedImages.length > 0) {
      for (const image of selectedImages) {
        const aspectRatio = await getAspectRatio(image);
        imageFiles.push({
          post_id: postId,
          kind: 'images' as const,
          content_type: image.type as FileSpec['content_type'],
          ext: mimeToImageExt(image.type),
          orientation: aspectRatio,
        });
      }
    }

    const imagePresignedUrlRequest: PostImagePresignedUrlRequest = {
      files: imageFiles,
    };

    const videoFiles: any[] = [];

    if (postType === 'video' && selectedSampleFile && isSample === 'upload') {
      const aspectRatio = await getAspectRatio(selectedSampleFile);
      const contentType = selectedSampleFile.type as VideoFileSpec['content_type'];
      const ext = mimeToExt(selectedSampleFile.type) as VideoFileSpec['ext'];

      const sampleVideoFile: any = {
        post_id: postId,
        kind: 'sample' as const,
        content_type: contentType,
        ext: ext,
        orientation: aspectRatio,
        sample_type: 'upload',
      };

      videoFiles.push(sampleVideoFile);
    }

    const videoPresignedUrlRequest: PostVideoPresignedUrlRequest = {
      files: videoFiles,
    };

    const imagePresignedUrl = await postImagePresignedUrl(imagePresignedUrlRequest);
    const videoPresignedUrl =
      postType === 'video' && videoPresignedUrlRequest.files.length > 0
        ? await postVideoPresignedUrl(videoPresignedUrlRequest)
        : { uploads: {} as any };

    return {
      imagePresignedUrl,
      videoPresignedUrl,
    };
  };

  // ファイルリセット関数を追加
  const resetAllFiles = () => {
    setSelectedMainFile(null);

    // revoke only blob:
    if (previewMainUrl && previewMainUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewMainUrl);
    }
    setPreviewMainUrl(null);

    setSelectedSampleFile(null);
    if (previewSampleUrl && previewSampleUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewSampleUrl);
    }
    setPreviewSampleUrl(null);
    setSampleDuration(null);

    setSelectedImages([]);

    if (ogp && ogp.startsWith('blob:')) URL.revokeObjectURL(ogp);
    setOgp(null);

    setOgpPreview(null);
    setThumbnail(null);
    setUploadMessage('');
  };

  const handlePostTypeChange = (type: 'video' | 'image') => {
    if (postType === type) return;
    resetAllFiles();
    setPostType(type);
  };

  useEffect(() => {
    if (user?.role !== UserRole.CREATOR) {
      setShowCreatorRequestDialog(true);
    } else {
      setShowCreatorRequestDialog(false);
    }
  }, [user]);

  return (
    <CommonLayout header={true}>
      <div className="bg-white min-h-screen">
        {/* タイトル */}
        <div className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-10 flex justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center w-full justify-center">
            <h1 className="text-xl font-semibold bg-white text-center">新規投稿</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="w-10 flex justify-center cursor-none"
            disabled
          />
        </div>

        {/* セグメントボタン */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              postType === 'video' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
            onClick={() => {
              handlePostTypeChange('video');
              setError({ show: false, messages: [] });
            }}
          >
            動画投稿
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              postType === 'image' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
            onClick={() => {
              handlePostTypeChange('image');
              setError({ show: false, messages: [] });
            }}
          >
            画像投稿
          </button>
        </div>

        {error.show && error.messages.length > 0 && (
          <ErrorMessage
            message={error.messages}
            variant="error"
            onClose={() => setError({ show: false, messages: [] })}
          />
        )}

        {postType === 'video' ? (
          <>
            <MainVideoSection
              selectedMainFile={selectedMainFile}
              previewMainUrl={previewMainUrl}
              thumbnail={thumbnail}
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadMessage={uploadMessage}
              isUploadingMainVideo={isUploadingMainVideo}
              uploadingProgress={uploadingProgress}
              onFileChange={handleMainVideoChange}
              onThumbnailChange={handleThumbnailChange}
              onRemove={removeVideo}
            />

            {selectedMainFile && (
              <>
                <SampleVideoSection
                  isSample={isSample}
                  previewSampleUrl={previewSampleUrl}
                  sampleDuration={sampleDuration}
                  sampleStartTime={sampleStartTime}
                  sampleEndTime={sampleEndTime}
                  onSampleTypeChange={(value) => setIsSample(value)}
                  onFileChange={handleSampleVideoChange}
                  onRemove={removeSampleVideo}
                  onEdit={showCutOutModal}
                />

                <OgpImageSection
                  ogp={ogp}
                  onFileChange={handleOgpChange}
                  onRemove={() => removeFile('ogp')}
                />
              </>
            )}
          </>
        ) : (
          <>
            <ImagePostSection
              selectedImages={selectedImages}
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadMessage={uploadMessage}
              onFileChange={handleImageChange}
              onRemove={removeImage}
              onImageClick={openImageModal}
            />

            <ThumbnailSection
              thumbnail={thumbnail}
              uploadProgress={uploadProgress.thumbnail}
              onThumbnailChange={handleThumbnailChange}
              onRemove={() => setThumbnail(null)}
            />

            <OgpImageSection
              ogp={ogp}
              onFileChange={handleOgpChange}
              onRemove={() => removeFile('ogp')}
            />
          </>
        )}

        <DescriptionSection
          description={formData.description}
          onChange={(value) => updateFormData('description', value)}
          onNgWordsDetected={setHasNgWords}
        />

        <CategorySection
          selectedCategories={selectedCategories}
          showCategoryModal={showCategoryModal}
          categories={categories}
          genres={genres}
          recommendedCategories={recommendedCategories}
          recentCategories={recentCategories}
          expandedGenres={expandedGenres}
          onCategorySelect={handleCategorySelection}
          onCategoryRemove={handleCategoryRemove}
          onExpandedGenresChange={setExpandedGenres}
          onModalOpenChange={setShowCategoryModal}
        />

        {/* <TagsSection tags={formData.tags} onChange={(value) => updateFormData('tags', value)} /> */}

        <SettingsSection
          scheduled={scheduled}
          expiration={expiration}
          plan={plan}
          single={single}
          scheduledDate={formData.scheduledDate}
          scheduledTime={formData.scheduledTime}
          expirationDate={formData.expirationDate}
          selectedPlanId={selectedPlanId}
          selectedPlanName={selectedPlanName}
          singlePrice={formData.singlePrice || ''}
          showPlanSelector={showPlanSelector}
          isScheduledToggleDisabled={false}
          minScheduledDate={new Date()}
          onToggleSwitch={onToggleSwitch}
          onScheduledDateChange={(date) => updateScheduledDateTime(date, formData.scheduledTime)}
          onScheduledTimeChange={handleTimeSelection}
          onExpirationDateChange={(date) => updateFormData('expirationDate', date)}
          onPlanSelect={(planId, planName) => {
            if (selectedPlanId.includes(planId)) {
              const newPlanIds = selectedPlanId.filter((id) => id !== planId);
              const newPlanNames = selectedPlanName.filter(
                (_, index) => selectedPlanId[index] !== planId
              );
              setSelectedPlanId(newPlanIds);
              setSelectedPlanName(newPlanNames);
              updateFormData('plan_ids', newPlanIds);
            } else {
              const newPlanIds = [...selectedPlanId, planId];
              const newPlanNames = [...selectedPlanName, planName || ''];
              setSelectedPlanId(newPlanIds);
              setSelectedPlanName(newPlanNames);
              updateFormData('plan_ids', newPlanIds);
            }
          }}
          onPlanRemove={(index) => {
            const newPlanIds = selectedPlanId.filter((_, i) => i !== index);
            const newPlanNames = selectedPlanName.filter((_, i) => i !== index);
            setSelectedPlanId(newPlanIds);
            setSelectedPlanName(newPlanNames);
            updateFormData('plan_ids', newPlanIds);
          }}
          onPlanClear={() => {
            setSelectedPlanId([]);
            setSelectedPlanName([]);
            updateFormData('plan_ids', []);
          }}
          onSinglePriceChange={(value) => updateFormData('singlePrice', value)}
          onPlanSelectorOpen={() => setShowPlanSelector(true)}
          onPlanSelectorClose={() => setShowPlanSelector(false)}
          onErrorChange={(show, messages) => setError({ show, messages })}
        />

        <ConfirmationSection
          checks={checks}
          onCheckChange={(field, value) => setChecks({ ...checks, [field]: value })}
          onSelectAll={(checked) =>
            setChecks({
              confirm1: checked,
              confirm2: checked,
              confirm3: checked,
              confirm4: checked,
            })
          }
        />

        {/* 投稿ボタン */}
        <div className="border-b border-gray-200">
          <div className="m-4">
            <Button
              onClick={handleSubmitPost}
              disabled={!allChecked || uploading || hasNgWords}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-full"
            >
              {uploading ? '投稿中...' : '投稿する'}
            </Button>
          </div>

          <div className="bg-white">
            <FooterSection />
          </div>
        </div>

        {/* 動画切り取りモーダル */}
        {previewMainUrl && (
          <VideoTrimModal
            isOpen={showTrimModal}
            onClose={() => setShowTrimModal(false)}
            videoUrl={previewMainUrl}
            onComplete={handleTrimComplete}
            maxDuration={300}
            initialStartTime={sampleStartTime}
            initialEndTime={sampleEndTime}
          />
        )}

        <UploadProgressModal
          isOpen={uploading}
          progress={overallProgress}
          title="投稿中"
          message={uploadMessage || 'ファイルをアップロード中です...'}
        />

        <ImageGalleryModal
          isOpen={showImageGallery}
          images={galleryImages}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageGallery(false)}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          getImageLabel={getImageLabel}
        />

        {showCreatorRequestDialog && (
          <CreatorRequestDialog
            isOpen={showCreatorRequestDialog}
            onClose={() => {
              setShowCreatorRequestDialog(false);
              navigate('/');
            }}
          />
        )}
      </div>
      <BottomNavigation />
    </CommonLayout>
  );
}
