// react要素をインポート
import React, { useState, useEffect } from 'react';
import {
  getGenres,
  getCategories,
  getRecommendedCategories,
  getRecentCategories,
  Category,
  Genre,
} from '@/api/endpoints/categories';
import { useNavigate } from 'react-router-dom';

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
import { postImagePresignedUrl, postVideoPresignedUrl } from '@/api/endpoints/postMedia';
import { generateMediaPresignedUrl } from '@/api/endpoints/generation_media';

// エンドポイントをインポート
import { createPost } from '@/api/endpoints/post';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { ErrorMessage } from '@/components/common';
import {
  uploadTempMainVideo,
  createSampleVideo,
  cleanupTempFiles,
} from '@/api/endpoints/videoTemp';
import VideoTrimModal from '@/features/shareVideo/componets/VideoTrimModal';
import { UploadProgressModal } from '@/components/common/UploadProgressModal';
import { convertLocalJSTToUTC } from '@/utils/convertDatetimeToLocalTimezone';
import { ArrowLeft } from 'lucide-react';

import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { useAuth } from '@/providers/AuthContext';
import CreatorRequestDialog from '@/components/common/CreatorRequestDialog';
import { UserRole } from '@/utils/userRole';

export default function ShareVideo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState({ show: false, messages: [] as string[] });
  const [postType, setPostType] = useState<'video' | 'image'>('video');
  const [showCreatorRequestDialog, setShowCreatorRequestDialog] = useState(false);

  // メイン動画関連の状態
  const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
  const [previewMainUrl, setPreviewMainUrl] = useState<string | null>(null);

  // サンプル動画関連の状態
  const [selectedSampleFile, setSelectedSampleFile] = useState<File | null>(null);
  const [previewSampleUrl, setPreviewSampleUrl] = useState<string | null>(null);
  const [sampleDuration, setSampleDuration] = useState<string | null>(null);
  const [sampleStartTime, setSampleStartTime] = useState<number>(0); // サンプル動画の開始時間（秒）
  const [sampleEndTime, setSampleEndTime] = useState<number>(0); // サンプル動画の終了時間（秒）
  const [tempVideoId, setTempVideoId] = useState<string | null>(null); // 一時動画ID
  const [tempVideoUrl, setTempVideoUrl] = useState<string | null>(null); // サーバー上の一時動画URL
  const [showTrimModal, setShowTrimModal] = useState(false); // 切り取りモーダル表示状態
  const [isUploadingMainVideo, setIsUploadingMainVideo] = useState(false); // 本編動画アップロード中
  const [uploadingProgress, setUploadingProgress] = useState<number>(0); // 本編動画アップロード進捗
  const [isGeneratingSample, setIsGeneratingSample] = useState(false); // サンプル動画生成中
  const [sampleGenerationProgress, setSampleGenerationProgress] = useState<number>(0); // サンプル動画生成進捗

  // 画像関連の状態
  const [ogp, setOgp] = useState<string | null>(null);
  const [ogpPreview, setOgpPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

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
  const [overallProgress, setOverallProgress] = useState<number>(0); // 全体の進捗率 (0-100)

  // アスペクト比を判定する関数
  const getAspectRatio = (file: File): Promise<'portrait' | 'landscape' | 'square'> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
        // 動画の場合
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const aspectRatio = video.videoWidth / video.videoHeight;
          if (aspectRatio > 1.1) {
            resolve('landscape');
          } else if (aspectRatio < 0.9) {
            resolve('portrait');
          } else {
            resolve('square');
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        // 画像の場合
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio > 1.1) {
            resolve('landscape');
          } else if (aspectRatio < 0.9) {
            resolve('portrait');
          } else {
            resolve('square');
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve('square'); // デフォルト
      }
    });
  };

  // フォームデータの状態管理
  const [formData, setFormData] = useState<
    PostData & { singlePrice?: string; orientation?: 'portrait' | 'landscape' | 'square' }
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
          console.log('Recent categories not available (user not authenticated)');
          setRecentCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories data:', error);
      }
    };
    fetchData();
  }, []);

  // サムネイル生成
  useEffect(() => {
    if (!selectedMainFile) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(selectedMainFile);
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.playsInline = true; // モバイル対応
    video.muted = true; // iOS対応

    const generateThumbnail = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SHARE_VIDEO_CONSTANTS.THUMBNAIL_SIZE;
      canvas.height = SHARE_VIDEO_CONSTANTS.THUMBNAIL_SIZE;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setThumbnail(thumbnailDataUrl);
      }

      // クリーンアップ
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    // loadedmetadataイベントでメタデータ読み込み完了を待つ
    video.addEventListener('loadedmetadata', () => {
      // 1秒の位置に移動
      video.currentTime = Math.min(1, video.duration);
    });

    // seekedイベントでシーク完了後にサムネイル生成
    video.addEventListener('seeked', generateThumbnail, { once: true });

    // エラーハンドリング
    video.addEventListener('error', (e) => {
      console.error('サムネイル生成エラー:', e);
      URL.revokeObjectURL(video.src);
      video.remove();
    });

    // メタデータのロードを開始
    video.load();
  }, [selectedMainFile]);

  // 日時更新処理の共通化
  const updateScheduledDateTime = (date?: Date, time?: string) => {
    if (date) {
      setFormData((prev) => ({ ...prev, scheduledDate: date }));
    }
    if (time) {
      updateFormData('scheduledTime', time);
    }

    // 日付と時間を組み合わせてフォーマット
    const currentDate = date || formData.scheduledDate;
    const currentTime = time || formData.scheduledTime;

    if (currentDate && currentTime) {
      const formattedDateTime = formatDateTime(currentDate, currentTime);
      updateFormData('formattedScheduledDateTime', formattedDateTime);
    }
  };

  // 時間選択処理の共通化
  const handleTimeSelection = (value: string, isHour: boolean) => {
    let finalTime: string;

    if (isHour) {
      // 時間選択時
      finalTime = `${value}:00`;
    } else {
      // 分選択時
      const currentHour = formData.scheduledTime ? formData.scheduledTime.split(':')[0] : '00';
      finalTime = `${currentHour}:${value}`;
    }

    updateScheduledDateTime(undefined, finalTime);
  };

  // ファイル処理の共通化
  const handleFileChange = async (file: File | null, fileType: PostFileKind) => {
    if (file) {
      switch (fileType) {
        case 'main':
          setSelectedMainFile(file);
          setPreviewMainUrl(URL.createObjectURL(file));
          break;
        case 'sample':
          setSelectedSampleFile(file);
          break;
        case 'ogp':
          setOgp(URL.createObjectURL(file));
          break;
        case 'thumbnail':
          // thumbnailはbase64文字列として保存するため、FileReaderを使用
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
        if (previewMainUrl) {
          URL.revokeObjectURL(previewMainUrl);
          setPreviewMainUrl('');
        }
        setThumbnail(null);
        break;
      case 'sample':
        setSelectedSampleFile(null);
        if (previewSampleUrl) {
          // ローカルBlobURLの場合のみrevokeする（サーバーURLの場合は不要）
          if (previewSampleUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewSampleUrl);
          }
          setPreviewSampleUrl('');
        }
        setSampleStartTime(0);
        setSampleEndTime(0);
        setSampleDuration(null);
        break;
      case 'ogp':
        setOgp(null);
        break;
      case 'thumbnail':
        setThumbnail(null);
        break;
    }
  };

  // 既存のファイル処理関数を保持（互換性のため）
  const handleMainVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // ファイルバリデーション size <= 20GB
    if (file.size > SHARE_VIDEO_CONSTANTS.MAX_FILE_SIZE) {
      // alert(SHARE_VIDEO_VALIDATION_MESSAGES.FILE_SIZE_ERROR);
      setError({ show: true, messages: [SHARE_VIDEO_VALIDATION_MESSAGES.FILE_SIZE_ERROR] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUploadMessage(''); // 前回のメッセージをクリア
    setError({ show: false, messages: [] }); // エラーメッセージをクリア

    // バックグラウンドでサーバーに一時アップロード
    setIsUploadingMainVideo(true);
    setUploadingProgress(0);
    try {
      setUploadMessage('動画をサーバーにアップロード中...');
      const response = await uploadTempMainVideo(file, (progress) => {
        setUploadingProgress(progress);
      });
      setTempVideoId(response.temp_video_id);

      // サーバー上の動画URLを保存（APIのベースURLを使用）
      const serverVideoUrl = `${import.meta.env.VITE_API_BASE_URL}${response.temp_video_url}`;
      setTempVideoUrl(serverVideoUrl);

      // ファイル情報を保存（サムネイル生成用）
      setSelectedMainFile(file);

      // アップロード完了後はサーバーのURLをプレビューに使用
      setPreviewMainUrl(serverVideoUrl);

      setUploadMessage('');
    } catch (error) {
      console.error('一時動画アップロードエラー:', error);
      setError({ show: true, messages: ['動画のアップロードに失敗しました'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsUploadingMainVideo(false);
      setUploadingProgress(0);
    }
  };

  const handleSampleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError({ show: false, messages: [] });
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1024) {
        setError({
          show: true,
          messages: [SHARE_VIDEO_VALIDATION_MESSAGES.SAMPLE_VIDEO_SIZE_ERROR],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      handleFileChange(file, 'sample');
      const url = URL.createObjectURL(file);
      setPreviewSampleUrl(url);

      // 動画要素を一時的に生成して再生時間取得
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;

      video.onloadedmetadata = () => {
        const durationInSeconds = video.duration;

        // 5分以下のバリデーション
        if (durationInSeconds > SHARE_VIDEO_CONSTANTS.MAX_SAMPLE_VIDEO_DURATION) {
          setError({
            show: true,
            messages: [SHARE_VIDEO_VALIDATION_MESSAGES.SAMPLE_VIDEO_DURATION_ERROR],
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // ファイルをクリア
          setSelectedSampleFile(null);
          URL.revokeObjectURL(url);
          setPreviewSampleUrl('');
          return;
        }

        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        setSampleDuration(formatTime(minutes, seconds));
      };
    }
  };

  const handleOgpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file, 'ogp');
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setThumbnail(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // チェックボックスの全てがtrueかどうかを判定
  const allChecked = Object.values(checks).every(Boolean);

  // 動画削除
  const removeVideo = () => {
    removeFile('main');
    setError({ show: false, messages: [] });
  };

  // サンプル動画削除
  const removeSampleVideo = () => {
    removeFile('sample');
    setError({ show: false, messages: [] });
  };

  // カットアウトモーダルを表示
  const showCutOutModal = () => {
    if (!tempVideoId || !tempVideoUrl) {
      setError({ show: true, messages: ['本編動画を先にアップロードしてください'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowTrimModal(true);
  };

  // サンプル動画の切り取り完了処理
  const handleTrimComplete = async (startTime: number, endTime: number) => {
    if (!tempVideoId) return;

    setIsGeneratingSample(true);
    setSampleGenerationProgress(0);
    try {
      setUploadMessage('サンプル動画を生成中...');
      const response = await createSampleVideo(
        {
          temp_video_id: tempVideoId,
          start_time: startTime,
          end_time: endTime,
        },
        (progress) => {
          setSampleGenerationProgress(progress);
        }
      );

      // サンプル動画のプレビューURLを設定（サーバーURL）
      const sampleUrl = `${import.meta.env.VITE_API_BASE_URL}${response.sample_video_url}`;
      setPreviewSampleUrl(sampleUrl);

      // 再生時間を設定
      const minutes = Math.floor(response.duration / 60);
      const seconds = Math.floor(response.duration % 60);
      setSampleDuration(formatTime(minutes, seconds));

      // 開始時間・終了時間を保存
      setSampleStartTime(startTime);
      setSampleEndTime(endTime);

      // サーバー側で生成されたサンプル動画を使用するため、
      // Fileオブジェクトのダウンロードは不要（パフォーマンス改善）
      // 投稿時にはサーバー上のファイルを直接使用する

      setUploadMessage('');
    } catch (error: any) {
      console.error('サンプル動画生成エラー:', error);
      setError({
        show: true,
        messages: [`サンプル動画の生成に失敗しました: ${error.message || '不明なエラー'}`],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsGeneratingSample(false);
      setSampleGenerationProgress(0);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError({ show: false, messages: [] });
    const files = e.target.files;
    if (selectedImages.length > 1) {
      setError({ show: true, messages: [SHARE_VIDEO_VALIDATION_MESSAGES.IMAGE_COUNT_ERROR] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (files) {
      const newImages = Array.from(files);
      setSelectedImages((prev) => [...prev, ...newImages]);

      // 最初の画像のアスペクト比を判定してformDataにセット
      if (newImages.length > 0) {
        try {
          const aspectRatio = await getAspectRatio(newImages[0]);
          setFormData((prev) => ({ ...prev, orientation: aspectRatio }));
        } catch (error) {
          console.error('アスペクト比の判定に失敗:', error);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setError({ show: false, messages: [] });
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // トグルスイッチの状態変更処理
  const onToggleSwitch = (
    field: 'scheduled' | 'expiration' | 'plan' | 'single',
    value: boolean
  ) => {
    // ローカル状態を更新
    if (field === 'scheduled') setScheduled(value);
    if (field === 'expiration') setExpiration(value);
    if (field === 'plan') setPlan(value);
    if (field === 'single') setSingle(value);

    // formDataも更新
    updateFormData(field, value);

    // 無効化時は関連データもクリア
    if (!value) {
      if (field === 'scheduled') {
        updateScheduledDateTime(new Date(), '');
      }
      if (field === 'expiration') {
        updateFormData('expirationDate', new Date());
      }
      if (field === 'plan') {
        updateFormData('plan_ids', []);
        // ローカルの選択状態もクリア
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
        // 既に選択されている場合は削除
        newCategories = prev.filter((id) => id !== categoryId);
      } else {
        // 新しく選択する場合、最大5つまで
        if (prev.length >= SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT) {
          // 最大数に達している場合はエラー表示
          setError({
            show: true,
            messages: [`カテゴリーは最大${SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT}つまで選択できます`],
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return prev;
        }
        newCategories = [...prev, categoryId];
      }

      // formData.genresを更新
      updateFormData('genres', newCategories);
      return newCategories;
    });
  };

  // カテゴリー削除処理
  const handleCategoryRemove = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.filter((id) => id !== categoryId);
      // formData.genresを更新
      updateFormData('genres', newCategories);
      return newCategories;
    });
  };

  // 投稿データをまとめて送信（AccountEdit.tsxと同じ処理フロー）
  const handleSubmitPost = async () => {
    const errorMessages = [] as string[];
    // バリデーション
    if (postType === 'video' && !selectedMainFile) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.MAIN_VIDEO_REQUIRED);
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.MAIN_VIDEO_REQUIRED);
    }

    // サンプル動画のバリデーション
    if (postType === 'video' && !selectedSampleFile && !previewSampleUrl) {
      errorMessages.push('サンプル動画を設定してください');
    }

    if (postType === 'image' && selectedImages.length === 0) {
      // setUploadMessage('画像を選択してください。');
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.IMAGE_REQUIRED);
    }
    if (!formData.description.trim()) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.DESCRIPTION_REQUIRED);
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.DESCRIPTION_REQUIRED);
    }
    if (!allChecked) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.CONFIRMATION_REQUIRED);
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.CONFIRMATION_REQUIRED);
    }

    if (formData.scheduled && !formData.formattedScheduledDateTime) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_DATETIME_REQUIRED);
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_DATETIME_REQUIRED);
    }

    if (formData.expiration && !formData.expirationDate) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.EXPIRATION_DATE_REQUIRED);
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.EXPIRATION_DATE_REQUIRED);
    }

    if (
      (formData.scheduled && new Date(formData.formattedScheduledDateTime) <= new Date()) ||
      (formData.expiration && new Date(formData.expirationDate) <= new Date())
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_EXPIRATION_DATETIME_ERROR);
    }
    if ((formData.scheduled && formData.expiration) &&
      (new Date(formData.formattedScheduledDateTime) > new Date(formData.expirationDate))
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_MORETHAN_EXPIRATION_DATETIME_ERROR);
    }
    if (!formData.single && !formData.plan) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_ERROR);
    }

    if (formData.plan && !formData.plan_ids) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_REQUIRED);
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_REQUIRED);
    }

    if (formData.single && !formData.singlePrice) {
      // setUploadMessage(SHARE_VIDEO_VALIDATION_MESSAGES.SINGLE_PRICE_REQUIRED);
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

    try {
      // 基本情報を登録
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
      setOverallProgress(20);

      // 画像のpresigned URLを取得
      const { imagePresignedUrl, videoPresignedUrl } = await getPresignedUrl(response.id);
      setOverallProgress(30);

      // ファイル数をカウント
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

      // 2) S3 PUT（presigned URLを使用）
      const uploadFile = async (file: File, kind: PostFileKind, presignedData: any) => {
        const header = presignedData.required_headers;

        await putToPresignedUrl(presignedData, file, header, {
          onProgress: (pct) => {
            setUploadProgress((prev) => ({ ...prev, [kind]: pct }));
            // 全体の進捗を計算 (30% + 各ファイルアップロードで70%を分配)
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
        // メイン動画をアップロード
        if (selectedMainFile && videoPresignedUrl.uploads?.main) {
          await uploadFile(selectedMainFile, 'main', videoPresignedUrl.uploads.main);
        }

        // サンプル動画があればアップロード
        if (videoPresignedUrl.uploads?.sample) {
          if (selectedSampleFile) {
            // アップロードモード: ローカルファイルをアップロード
            await uploadFile(selectedSampleFile, 'sample', videoPresignedUrl.uploads.sample);
          } else if (previewSampleUrl && isSample === 'cut_out') {
            // カットアウトモード: サーバー上の一時ファイルをダウンロードしてアップロード
            const sampleBlob = await fetch(previewSampleUrl).then((r) => r.blob());
            const sampleFile = new File([sampleBlob], 'sample.mp4', { type: 'video/mp4' });
            await uploadFile(sampleFile, 'sample', videoPresignedUrl.uploads.sample);
          }
        }

        // サムネイル画像があればアップロード
        if (thumbnail && imagePresignedUrl.uploads?.thumbnail) {
          // base64文字列をBlobに変換してFileオブジェクトに変換
          const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
          const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
          await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
        }

        // 画像投稿の場合もサムネイル画像があればアップロード
        if (thumbnail && imagePresignedUrl.uploads?.thumbnail) {
          // base64文字列をBlobに変換してFileオブジェクトに変換
          const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
          const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
          await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
        }

        // OGP画像があればアップロード
        if (ogp && imagePresignedUrl.uploads?.ogp) {
          // base64文字列をBlobに変換してFileオブジェクトに変換
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

            // 画像投稿の場合もサムネイル画像があればアップロード
            if (thumbnail && imagePresignedUrl.uploads?.thumbnail) {
              // base64文字列をBlobに変換してFileオブジェクトに変換
              const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
              const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', {
                type: 'image/jpeg',
              });
              await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
            }

            // OGP画像があればアップロード
            if (ogp && imagePresignedUrl.uploads?.ogp) {
              // base64文字列をBlobに変換してFileオブジェクトに変換
              const ogpBlob = await fetch(ogp).then((r) => r.blob());
              const ogpFile = new File([ogpBlob], 'ogp.jpg', { type: 'image/jpeg' });
              await uploadFile(ogpFile, 'ogp', imagePresignedUrl.uploads.ogp);
            } else {
              const presignedUrl = await generateMediaPresignedUrl(response.id);
            }
          }
        }
      }

      setOverallProgress(100);
      setUploadMessage(
        postType === 'video' ? '動画の投稿が完了しました！' : '画像の投稿が完了しました！'
      );

      // 一時ファイルのクリーンアップ（動画投稿の場合のみ）
      if (postType === 'video' && tempVideoId) {
        await cleanupTempFiles(tempVideoId);
      }

      // 完了メッセージを少し表示してからナビゲート
      setTimeout(() => {
        navigate(`/`);
      }, 1000);
      return;
    } catch (error) {
      console.error('投稿エラー:', error);
      setUploadMessage('投稿に失敗しました。時間をおいて再試行してください。');
    } finally {
      setUploading(false);
      // プログレスバーをリセット
      setUploadProgress({
        main: 0,
        sample: 0,
        ogp: 0,
        thumbnail: 0,
        images: 0,
      });
      setError({ show: false, messages: [] });
    }
  };

  // プレシジョンURLを取得
  const getPresignedUrl = async (postId: string) => {
    // 画像類のアスペクト比を取得
    const imageFiles = [];

    // サムネイルのアスペクト比を取得
    if (thumbnail) {
      // サムネイルはbase64文字列なので、デフォルトでsquareとする
      imageFiles.push({
        post_id: postId,
        kind: 'thumbnail' as const,
        content_type: 'image/jpeg' as FileSpec['content_type'],
        ext: 'jpg' as const,
        orientation: 'square' as const,
      });
    }

    // OGP画像のアスペクト比を取得
    if (ogp) {
      // OGP画像もbase64文字列なので、デフォルトでsquareとする
      imageFiles.push({
        post_id: postId,
        kind: 'ogp' as const,
        content_type: 'image/jpeg' as FileSpec['content_type'],
        ext: 'jpg' as const,
        orientation: 'square' as const,
      });
    }

    // 画像ファイルのアスペクト比を取得
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

    // 動画類のアスペクト比を取得
    const videoFiles = [];

    // メイン動画のアスペクト比を取得
    if (postType === 'video' && selectedMainFile) {
      const aspectRatio = await getAspectRatio(selectedMainFile);
      videoFiles.push({
        post_id: postId,
        kind: 'main' as const,
        content_type: (selectedMainFile.type as VideoFileSpec['content_type']) || 'video/mp4',
        ext: mimeToExt(selectedMainFile.type || 'video/mp4') as VideoFileSpec['ext'],
        orientation: aspectRatio,
      });
    }

    // サンプル動画のアスペクト比を取得
    if (postType === 'video' && (selectedSampleFile || previewSampleUrl)) {
      let aspectRatio: 'portrait' | 'landscape' | 'square';
      let contentType: VideoFileSpec['content_type'];
      let ext: VideoFileSpec['ext'];

      if (selectedSampleFile) {
        // アップロードモード: ローカルファイルから取得
        aspectRatio = await getAspectRatio(selectedSampleFile);
        contentType = selectedSampleFile.type as VideoFileSpec['content_type'];
        ext = mimeToExt(selectedSampleFile.type) as VideoFileSpec['ext'];
      } else if (selectedMainFile) {
        // カットアウトモード: メイン動画と同じアスペクト比を使用
        aspectRatio = await getAspectRatio(selectedMainFile);
        contentType = (selectedMainFile.type as VideoFileSpec['content_type']) || 'video/mp4';
        ext = mimeToExt(selectedMainFile.type || 'video/mp4') as VideoFileSpec['ext'];
      } else {
        // デフォルト値
        aspectRatio = 'landscape';
        contentType = 'video/mp4';
        ext = 'mp4';
      }

      const sampleVideoFile: any = {
        post_id: postId,
        kind: 'sample' as const,
        content_type: contentType,
        ext: ext,
        orientation: aspectRatio,
      };

      // サンプル動画のタイプとメタデータを追加
      if (isSample === 'cut_out') {
        sampleVideoFile.sample_type = 'cut_out';
        sampleVideoFile.sample_start_time = sampleStartTime;
        sampleVideoFile.sample_end_time = sampleEndTime;
      } else {
        sampleVideoFile.sample_type = 'upload';
      }

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
    // 動画関連のリセット
    setSelectedMainFile(null);
    if (previewMainUrl) {
      URL.revokeObjectURL(previewMainUrl);
      setPreviewMainUrl(null);
    }
    setSelectedSampleFile(null);
    if (previewSampleUrl) {
      URL.revokeObjectURL(previewSampleUrl);
      setPreviewSampleUrl(null);
    }
    setSampleDuration(null);

    // 画像関連のリセット
    setSelectedImages([]);
    setOgp(null);
    setOgpPreview(null);
    setThumbnail(null);

    // メッセージのリセット
    setUploadMessage('');
  };

  // セグメントボタンのクリックハンドラーを修正
  const handlePostTypeChange = (type: 'video' | 'image') => {
    // 現在のタイプと同じ場合は何もしない
    if (postType === type) return;

    // ファイルをリセット
    resetAllFiles();

    // 投稿タイプを変更
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
      <Header />
      {/* タイトル */}
      <div className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center w-full justify-center">
          <h1 className="text-xl font-semibold bg-white text-center">
            新規投稿
          </h1>
        </div>
      </div>

      {/* セグメントボタン */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${postType === 'video' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          onClick={() => {
            handlePostTypeChange('video');
            setError({ show: false, messages: [] });
          }}
        >
          動画投稿
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${postType === 'image' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          onClick={() => {
            handlePostTypeChange('image');
            setError({ show: false, messages: [] });
          }}
        >
          画像投稿
        </button>
      </div>

      {error.show && <ErrorMessage message={error.messages} variant="error" />}

      {postType === 'video' ? (
        <>
          {/* メイン動画セクション */}
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
              {/* サンプル動画セクション */}
              <SampleVideoSection
                isSample={isSample}
                previewSampleUrl={previewSampleUrl}
                sampleDuration={sampleDuration}
                sampleStartTime={sampleStartTime}
                sampleEndTime={sampleEndTime}
                isGeneratingSample={isGeneratingSample}
                sampleGenerationProgress={sampleGenerationProgress}
                onSampleTypeChange={(value) => setIsSample(value)}
                onFileChange={handleSampleVideoChange}
                onRemove={removeSampleVideo}
                onEdit={showCutOutModal}
              />

              {/* OGP画像セクション */}
              <OgpImageSection ogp={ogp} onFileChange={handleOgpChange} />
            </>
          )}
        </>
      ) : (
        <>
          {/* 画像投稿セクション */}
          <ImagePostSection
            selectedImages={selectedImages}
            uploading={uploading}
            uploadProgress={uploadProgress}
            uploadMessage={uploadMessage}
            onFileChange={handleImageChange}
            onRemove={removeImage}
          />
          {/* 画像投稿の場合のサムネイル設定セクション */}
          <ThumbnailSection
            thumbnail={thumbnail}
            uploadProgress={uploadProgress.thumbnail}
            onThumbnailChange={handleThumbnailChange}
            onRemove={() => setThumbnail(null)}
          />

          {/* OGP画像セクション */}
          <OgpImageSection ogp={ogp} onFileChange={handleOgpChange} />
        </>
      )}

      {/* 説明文セクション */}
      <DescriptionSection
        description={formData.description}
        onChange={(value) => updateFormData('description', value)}
      />

      {/* カテゴリー選択セクション */}
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

      {/* タグ入力セクション */}
      <TagsSection tags={formData.tags} onChange={(value) => updateFormData('tags', value)} />

      {/* 設定オプションセクション */}
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
        onToggleSwitch={onToggleSwitch}
        onScheduledDateChange={(date) => updateScheduledDateTime(date, formData.scheduledTime)}
        onScheduledTimeChange={handleTimeSelection}
        onExpirationDateChange={(date) => updateFormData('expirationDate', date)}
        onPlanSelect={(planId, planName) => {
          // 既に選択されているプランかチェック
          if (selectedPlanId.includes(planId)) {
            // 既に選択済みの場合は削除
            const newPlanIds = selectedPlanId.filter((id) => id !== planId);
            const newPlanNames = selectedPlanName.filter(
              (_, index) => selectedPlanId[index] !== planId
            );
            setSelectedPlanId(newPlanIds);
            setSelectedPlanName(newPlanNames);
            updateFormData('plan_ids', newPlanIds);
          } else {
            // 新しく追加
            const newPlanIds = [...selectedPlanId, planId];
            const newPlanNames = [...selectedPlanName, planName || ''];
            setSelectedPlanId(newPlanIds);
            setSelectedPlanName(newPlanNames);
            updateFormData('plan_ids', newPlanIds);
          }
          setShowPlanSelector(false);
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
      />

      {/* 確認項目セクション */}
      <ConfirmationSection
        checks={checks}
        onCheckChange={(field, value) => setChecks({ ...checks, [field]: value })}
        onSelectAll={(checked) =>
          setChecks({
            confirm1: checked,
            confirm2: checked,
            confirm3: checked,
          })
        }
      />

      {/* ✅ 投稿ボタン */}
      <div className="bg-white border-b border-gray-200">
        <div className="m-4">
          <Button
            onClick={handleSubmitPost}
            disabled={!allChecked || uploading}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            {uploading ? '投稿中...' : '投稿する'}
          </Button>
        </div>

        {/* フッターセクション */}
        <div className="bg-white">
          <FooterSection />
        </div>
      </div>

      {/* 動画切り取りモーダル */}
      {tempVideoUrl && (
        <VideoTrimModal
          isOpen={showTrimModal}
          onClose={() => setShowTrimModal(false)}
          videoUrl={tempVideoUrl}
          onComplete={handleTrimComplete}
          maxDuration={300} // 5分
          initialStartTime={sampleStartTime}
          initialEndTime={sampleEndTime}
        />
      )}

      {/* アップロード進捗モーダル */}
      <UploadProgressModal
        isOpen={uploading}
        progress={overallProgress}
        title="投稿中"
        message={uploadMessage || 'ファイルをアップロード中です...'}
      />

      {showCreatorRequestDialog && (
        <CreatorRequestDialog
          isOpen={showCreatorRequestDialog}
          onClose={() => {setShowCreatorRequestDialog(false); navigate('/');}}
        />
      )}

      <BottomNavigation />
    </CommonLayout>
  );
}
