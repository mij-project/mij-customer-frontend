// react要素をインポート
import React, { useState, useEffect, useMemo } from 'react';
import {
  getGenres,
  getCategories,
  getRecommendedCategories,
  getRecentCategories,
  Category,
  Genre,
} from '@/api/endpoints/categories';
import { useNavigate, useParams } from 'react-router-dom';
import ImageGalleryModal from '@/components/common/ImageGalleryModal';
import { ArrowLeft } from 'lucide-react';

// 型定義
import { PostData } from '@/api/types/postMedia';
import { UpdatePostRequest } from '@/api/types/post';
import {
  SHARE_VIDEO_CONSTANTS,
  SHARE_VIDEO_VALIDATION_MESSAGES,
} from '@/features/shareVideo/constans/constans';
import { POST_STATUS, PostFileKind } from '@/constants/constants';

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
import VideoTrimModal from '@/features/shareVideo/componets/VideoTrimModal';

// ユーティリティ
import { formatDateTime, formatTime } from '@/lib/datetime';
import { mimeToImageExt, mimeToExt } from '@/lib/media';

// コンポーネントをインポート
import { Button } from '@/components/ui/button';
import { FileSpec, VideoFileSpec } from '@/api/types/commons';
import {
  PutVideoPresignedUrlRequest,
  PutImagePresignedUrlRequest,
  UpdateImagesPresignedUrlRequest,
} from '@/api/types/postMedia';
import {
  putImagePresignedUrl,
  putVideoPresignedUrl,
  updateImages,
  deleteMediaAsset,
  triggerBatchProcess,
} from '@/api/endpoints/postMedia';
import Alert from '@/components/common/Alert';
import ErrorMessage from '@/components/common/ErrorMessage';

// エンドポイントをインポート
import { getAccountPostDetail, updateAccountPost } from '@/api/endpoints/account';
import { AccountMediaAsset } from '@/api/types/account';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { updatePost } from '@/api/endpoints/post';
import { MEDIA_ASSET_KIND, MEDIA_ASSET_STATUS } from '@/constants/constants';
import { uploadTempMainVideo, getTempVideoPlaybackUrl } from '@/api/endpoints/videoTemp';
import { UploadProgressModal } from '@/components/common/UploadProgressModal';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';

import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';

// media_assetsからkindでフィルタして取得するヘルパー関数
const getMediaAssetByKind = (
  mediaAssets: Record<string, AccountMediaAsset>,
  kind: number
): AccountMediaAsset | null => {
  const entry = Object.entries(mediaAssets).find(([_, asset]) => asset.kind === kind);
  return entry ? entry[1] : null;
};

// media_assetsから特定kindのすべてを取得
const getMediaAssetsByKind = (
  mediaAssets: Record<string, AccountMediaAsset>,
  kind: number
): AccountMediaAsset[] => {
  return Object.values(mediaAssets).filter((asset) => asset.kind === kind);
};

export default function PostEdit() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState<'video' | 'image'>('video');
  const [postStatus, setPostStatus] = useState<number>(0); // 投稿ステータス
  const [postRejectComments, setPostRejectComments] = useState<string | null>(null); // 投稿の拒否理由
  const [mediaAssetRejectComments, setMediaAssetRejectComments] = useState<Array<{ kind: number; message: string }>>([]); // メディアアセットの拒否理由リスト

  // メディアアセットのkindを日本語ラベルに変換
  const getMediaKindLabel = (kind: number): string => {
    switch (kind) {
      case MEDIA_ASSET_KIND.OGP:
        return 'OGP画像';
      case MEDIA_ASSET_KIND.THUMBNAIL:
        return 'サムネイル';
      case MEDIA_ASSET_KIND.IMAGES:
        return '投稿画像';
      case MEDIA_ASSET_KIND.MAIN_VIDEO:
        return 'メイン動画';
      case MEDIA_ASSET_KIND.SAMPLE_VIDEO:
        return 'サンプル動画';
      case MEDIA_ASSET_KIND.IMAGE_ORIGINAL:
        return '画像（オリジナル）';
      case MEDIA_ASSET_KIND.IMAGE_1080W:
        return '画像（1080w）';
      case MEDIA_ASSET_KIND.IMAGE_MOSAIC:
        return '画像（モザイク）';
      default:
        return 'メディア';
    }
  };

  // メイン動画関連の状態
  const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
  const [previewMainUrl, setPreviewMainUrl] = useState<string | null>(null);
  const [existingMainVideoUrl, setExistingMainVideoUrl] = useState<string | null>(null); // 既存動画URL
  const [existingMainVideoId, setExistingMainVideoId] = useState<string | null>(null); // 既存メイン動画のメディアアセットID

  // サンプル動画関連の状態
  const [selectedSampleFile, setSelectedSampleFile] = useState<File | null>(null);
  const [previewSampleUrl, setPreviewSampleUrl] = useState<string | null>(null);
  const [existingSampleVideoUrl, setExistingSampleVideoUrl] = useState<string | null>(null); // 既存サンプル動画URL
  const [existingSampleVideoId, setExistingSampleVideoId] = useState<string | null>(null); // 既存サンプル動画のメディアアセットID
  const [sampleDuration, setSampleDuration] = useState<string | null>(null);
  const [sampleStartTime, setSampleStartTime] = useState<number>(0); // サンプル動画の開始時間（秒）
  const [sampleEndTime, setSampleEndTime] = useState<number>(0); // サンプル動画の終了時間（秒）
  const [tempVideoS3Key, setTempVideoS3Key] = useState<string | null>(null); // S3上の一時動画キー
  const [showTrimModal, setShowTrimModal] = useState(false); // プレビュー範囲設定モーダル表示状態
  const [isUploadingMainVideo, setIsUploadingMainVideo] = useState(false); // 本編動画アップロード中
  const [uploadingMainVideoProgress, setUploadingMainVideoProgress] = useState<number>(0); // 本編動画アップロード進捗

  // 画像関連の状態
  const [ogp, setOgp] = useState<string | null>(null);
  const [ogpFile, setOgpFile] = useState<File | null>(null); // OGP画像のFileオブジェクト
  const [ogpPreview, setOgpPreview] = useState<string | null>(null);
  const [existingOgpUrl, setExistingOgpUrl] = useState<string | null>(null); // 既存OGP画像URL
  const [existingOgpId, setExistingOgpId] = useState<string | null>(null); // 既存OGP画像のメディアアセットID
  const [isOgpDeleted, setIsOgpDeleted] = useState<boolean>(false); // OGP画像が削除されたかどうか
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isThumbnailChanged, setIsThumbnailChanged] = useState<boolean>(false); // サムネイルが変更されたかどうか
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // 既存画像URLリスト
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]); // 既存画像IDリスト
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]); // 削除された既存画像のID

  // 動画設定の状態
  const [isSample, setIsSample] = useState<'upload' | 'cut_out'>('upload');
  const [initialSampleType, setInitialSampleType] = useState<'upload' | 'cut_out'>('upload'); // 初期値を保存
  const [isMainVideoChanged, setIsMainVideoChanged] = useState(false); // メイン動画が変更されたかどうか
  const [isSampleReconfigured, setIsSampleReconfigured] = useState(false); // サンプル動画が再設定されたかどうか

  // トグルスイッチの状態
  const [scheduled, setScheduled] = useState(false);
  const [expiration, setExpiration] = useState(false);
  const [plan, setPlan] = useState(false);
  const [single, setSingle] = useState(false);
  const [isScheduledDisabled, setIsScheduledDisabled] = useState(false); // 予約投稿が過去日の場合true

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
  const [overallProgress, setOverallProgress] = useState<number>(0); // 全体の進捗率 (0-100)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertDescription, setAlertDescription] = useState<string>('');
  const [error, setError] = useState({ show: false, messages: [] as string[] });
  const [hasNgWords, setHasNgWords] = useState(false); // NGワード検出状態

  // 画像ギャラリーモーダル用の状態
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // アスペクト比を判定する関数
  const getAspectRatio = (file: File): Promise<'portrait' | 'landscape' | 'square'> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
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
        resolve('square');
      }
    });
  };

  // フォームデータの状態管理
  const [formData, setFormData] = useState<
    PostData & { singlePrice?: string; orientation?: 'portrait' | 'landscape' | 'square' }
  >({
    post_id: postId!,
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

  // 初期データ（変更検知用）
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);

  // 既存データを取得して初期化
  useEffect(() => {
    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

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

  // 投稿詳細を取得
  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const data = await getAccountPostDetail(postId!);
      // 投稿タイプを設定（切り替え不可）
      setPostType(data.post_type === 1 ? 'video' : 'image');

      // 投稿ステータスを設定
      setPostStatus(data.status);

      // 拒否理由を設定（REJECTED状態の場合）
      if (data.status === POST_STATUS.REJECTED) {
        // 投稿の拒否理由
        if (data.reject_comments) {
          setPostRejectComments(data.reject_comments);
        }

        // メディアアセットの拒否理由を収集
        const rejectComments: Array<{ kind: number; message: string }> = [];
        Object.values(data.media_assets).forEach((asset) => {
          if (asset.status === MEDIA_ASSET_STATUS.REJECTED && asset.reject_comments) {
            rejectComments.push({
              kind: asset.kind,
              message: asset.reject_comments
            });
          }
        });
        setMediaAssetRejectComments(rejectComments);
      }

      // カテゴリー情報を設定
      if (data.category_ids && data.category_ids.length > 0) {
        setSelectedCategories(data.category_ids);
      }

      // プラン情報を設定
      if (data.plan_list && data.plan_list.length > 0) {
        setSelectedPlanId(data.plan_list.map((plan) => plan.id));
        setSelectedPlanName(data.plan_list.map((plan) => plan.name));
        setPlan(true);
      }

      // 単品販売の設定
      if (data.price && data.price > 0) {
        setSingle(true);
      }

      // 予約投稿の設定
      if (data.scheduled_at) {
        // const scheduledDate = new Date(data.scheduled_at);
        const scheduledDate = new Date(convertDatetimeToLocalTimezone(data.scheduled_at));
        const now = new Date();

        // 過去日かどうかをチェック
        const isPast = scheduledDate < now;

        setScheduled(true); // トグルは常にオン（値を表示するため）
        setIsScheduledDisabled(isPast); // 過去日の場合は入力欄を非活性化

        // 日付と時刻を分離
        const timeStr = scheduledDate.toTimeString().slice(0, 5);

        setFormData((prev) => ({
          ...prev,
          scheduledDate: scheduledDate,
          scheduledTime: timeStr,
        }));
      }

      // 公開期限の設定
      if (data.expiration_at) {
        // const expirationDate = new Date(data.expiration_at);
        const expirationDate = new Date(convertDatetimeToLocalTimezone(data.expiration_at));
        setExpiration(true);

        // 日付と時刻を分離
        const timeStr = expirationDate.toTimeString().slice(0, 5);

        setFormData((prev) => ({
          ...prev,
          expirationDate: expirationDate,
          expirationTime: timeStr,
        }));
      }

      // フォームデータを初期化
      const newFormData = {
        ...formData,
        description: data.description,
        singlePrice: data.price?.toString() || '',
        tags: data.tags || '',
        genres: data.category_ids || [],
        plan_list: data.plan_list ? data.plan_list.map((plan) => plan.id) : [],
        single: data.price > 0,
        plan: data.plan_list && data.plan_list.length > 0,
      };
      setFormData(newFormData);

      // 初期データを保存（変更検知用）
      setInitialFormData(newFormData);

      // media_assetsから情報を抽出
      const thumbnailAsset = getMediaAssetByKind(data.media_assets, MEDIA_ASSET_KIND.THUMBNAIL);
      const ogpAsset = getMediaAssetByKind(data.media_assets, MEDIA_ASSET_KIND.OGP);
      const mainVideoAsset = getMediaAssetByKind(data.media_assets, MEDIA_ASSET_KIND.MAIN_VIDEO);
      const sampleVideoAsset = getMediaAssetByKind(
        data.media_assets,
        MEDIA_ASSET_KIND.SAMPLE_VIDEO
      );
      const imageAssets = getMediaAssetsByKind(data.media_assets, MEDIA_ASSET_KIND.IMAGES);

      // サムネイルを設定
      if (thumbnailAsset?.storage_key) {
        setThumbnail(thumbnailAsset.storage_key);
      }

      if (ogpAsset?.storage_key) {
        setOgp(ogpAsset.storage_key);
        setExistingOgpUrl(ogpAsset.storage_key);
        // media_assets辞書のキーをOGP IDとして保存
        const ogpId = Object.entries(data.media_assets).find(
          ([_, asset]) => asset.kind === MEDIA_ASSET_KIND.OGP
        )?.[0];
        if (ogpId) {
          setExistingOgpId(ogpId);
        }
        setIsOgpDeleted(false); // 初期状態では削除されていない
      }

      // 動画の場合
      if (data.is_video) {
        if (sampleVideoAsset?.storage_key) {
          setExistingSampleVideoUrl(sampleVideoAsset.storage_key);
          setPreviewSampleUrl(sampleVideoAsset.storage_key);

          // サンプル動画のメディアアセットIDを保存
          const sampleVideoId = Object.entries(data.media_assets).find(
            ([_, asset]) => asset.kind === MEDIA_ASSET_KIND.SAMPLE_VIDEO
          )?.[0];
          if (sampleVideoId) {
            setExistingSampleVideoId(sampleVideoId);
          }

          // サンプル動画のメタデータを設定
          if (sampleVideoAsset.sample_type) {
            const sampleType = sampleVideoAsset.sample_type as 'upload' | 'cut_out';
            setIsSample(sampleType);
            setInitialSampleType(sampleType); // 初期値を保存
            if (sampleVideoAsset.sample_type === 'cut_out') {
              setSampleStartTime(Number(sampleVideoAsset.sample_start_time) || 0);
              setSampleEndTime(Number(sampleVideoAsset.sample_end_time) || 0);
            }
          }

          // サンプル動画の再生時間を設定
          if (sampleVideoAsset.duration_sec) {
            const minutes = Math.floor(Number(sampleVideoAsset.duration_sec) / 60);
            const seconds = Math.floor(Number(sampleVideoAsset.duration_sec) % 60);
            setSampleDuration(formatTime(minutes, seconds));
          }
        }
        if (mainVideoAsset?.storage_key) {
          setExistingMainVideoUrl(mainVideoAsset.storage_key);
          setPreviewMainUrl(mainVideoAsset.storage_key);

          // メイン動画のメディアアセットIDを保存
          const mainVideoId = Object.entries(data.media_assets).find(
            ([_, asset]) => asset.kind === MEDIA_ASSET_KIND.MAIN_VIDEO
          )?.[0];
          if (mainVideoId) {
            setExistingMainVideoId(mainVideoId);
          }
        }
      } else {
        // 画像の場合
        if (imageAssets.length > 0) {
          const imageUrls = imageAssets
            .map((asset) => asset.storage_key)
            .filter((url): url is string => url !== null);
          console.log('Setting existing images:', imageUrls);
          setExistingImages(imageUrls);

          // media_assets辞書のキーをimage_idsとして保存
          const imageIds = Object.entries(data.media_assets)
            .filter(([_, asset]) => asset.kind === MEDIA_ASSET_KIND.IMAGES)
            .map(([key, _]) => key);
          console.log('Setting existing image IDs:', imageIds);
          setExistingImageIds(imageIds);
        }
      }
    } catch (error) {
      console.error('投稿詳細の取得に失敗しました:', error);
      alert('投稿詳細の取得に失敗しました');
      navigate('/account/post');
    } finally {
      setLoading(false);
    }
  };

  // 日時更新処理の共通化
  const updateScheduledDateTime = (date?: Date, time?: string) => {
    if (date) {
      setFormData((prev) => ({ ...prev, scheduledDate: date }));
    }
    if (time) {
      updateFormData('scheduledTime', time);
    }

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
      finalTime = `${value}:00`;
    } else {
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
        if (previewMainUrl && previewMainUrl !== existingMainVideoUrl) {
          URL.revokeObjectURL(previewMainUrl);
        }
        // 既存動画に戻す
        setPreviewMainUrl(existingMainVideoUrl);
        break;
      case 'sample':
        setSelectedSampleFile(null);
        if (previewSampleUrl && previewSampleUrl !== existingSampleVideoUrl) {
          URL.revokeObjectURL(previewSampleUrl);
        }
        // 既存サンプル動画に戻す
        setPreviewSampleUrl(existingSampleVideoUrl);
        break;
      case 'ogp':
        setOgp(null);
        break;
      case 'thumbnail':
        setThumbnail(null);
        break;
    }
  };

  // 既存のファイル処理関数を保持
  const handleMainVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > SHARE_VIDEO_CONSTANTS.MAX_FILE_SIZE) {
      alert(SHARE_VIDEO_VALIDATION_MESSAGES.FILE_SIZE_ERROR);
      return;
    }

    setUploadMessage('');

    // S3に直接アップロード
    setIsUploadingMainVideo(true);
    setUploadingMainVideoProgress(0);
    try {
      setUploadMessage('動画をS3にアップロード中...');
      const response = await uploadTempMainVideo(file, (progress) => {
        setUploadingMainVideoProgress(progress);
      });

      // S3キーを保存
      setTempVideoS3Key(response.s3_key);

      // ファイル情報を保存
      setSelectedMainFile(file);

      // メイン動画が変更されたことをマーク
      setIsMainVideoChanged(true);
      setIsSampleReconfigured(false); // 再設定フラグをリセット

      // 再生用URLを取得
      setUploadMessage('動画の再生URLを取得中...');
      const playbackData = await getTempVideoPlaybackUrl(response.s3_key);
      setPreviewMainUrl(playbackData.playback_url);

      setUploadMessage('');
    } catch (error) {
      console.error('一時動画アップロードエラー:', error);
      alert('動画のアップロードに失敗しました');
    } finally {
      setIsUploadingMainVideo(false);
      setUploadingMainVideoProgress(0);
    }
  };

  // TODO : サンプル動画のバリデーションを追加
  const handleSampleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFileChange(file, 'sample');
      const url = URL.createObjectURL(file);
      setPreviewSampleUrl(url);

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;

      video.onloadedmetadata = () => {
        const durationInSeconds = video.duration;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        setSampleDuration(formatTime(minutes, seconds));
      };
    }
  };

  const handleOgpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOgp(url);
      setOgpFile(file); // Fileオブジェクトを保存
      setIsOgpDeleted(false); // 新しい画像を選択したので削除フラグをリセット
    }
  };

  // OGP画像削除処理
  const handleOgpRemove = () => {
    // 新規アップロード画像の場合
    if (ogp && !ogp.startsWith('http')) {
      URL.revokeObjectURL(ogp);
    }
    setOgp(null);
    setOgpFile(null); // Fileオブジェクトもクリア

    // 既存画像が存在していた場合は削除フラグを立てる
    if (existingOgpUrl) {
      setIsOgpDeleted(true);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setThumbnail(imageUrl);
        setIsThumbnailChanged(true); // サムネイルが変更されたことをマーク
      };
      reader.readAsDataURL(file);
    }
  };

  // チェックボックスの全てがtrueかどうかを判定
  const allChecked = Object.values(checks).every(Boolean);

  // 動画削除
  const removeVideo = () => {
    removeFile('main');
  };

  // サンプル動画削除
  const removeSampleVideo = () => {
    removeFile('sample');
    setSampleStartTime(0);
    setSampleEndTime(0);
    setTempVideoS3Key(null);
  };

  // カットアウトモーダルを表示
  const showCutOutModal = () => {
    if (!tempVideoS3Key || !previewMainUrl) {
      setIsAlertOpen(true);
      setAlertTitle('本編動画を先にアップロードしてください');
      setAlertDescription('本編動画を先にアップロードしてください');
      return;
    }
    setShowTrimModal(true);
  };

  // プレビュー範囲設定の完了処理（サーバー側の切り取り処理は削除）
  const handleTrimComplete = (startTime: number, endTime: number) => {
    // プレビュー範囲をフロント側で保存
    setSampleStartTime(startTime);
    setSampleEndTime(endTime);

    // サンプル動画が再設定されたことをマーク
    setIsSampleReconfigured(true);

    // プレビュー動画は本編動画と同じURLを使用
    setPreviewSampleUrl(previewMainUrl);

    // プレビュー範囲の再生時間を計算して表示
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    setSampleDuration(formatTime(minutes, seconds));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setSelectedImages((prev) => [...prev, ...newImages]);

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
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 既存画像の削除ハンドラ
  const removeExistingImage = (index: number) => {
    // 削除された既存画像のIDを記録
    const imageId = existingImageIds[index];
    if (imageId) {
      setDeletedImageIds((prev) => [...prev, imageId]);
    }
    // UI上から削除（表示から非表示にする）
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setExistingImageIds((prev) => prev.filter((_, i) => i !== index));
  };

  // 画像ギャラリー用の配列（サムネイル、本編画像、OGP）
  const galleryImages = useMemo(() => {
    const urls: string[] = [];
    const pushUrl = (url?: string | null) => {
      if (url) {
        urls.push(url);
      }
    };

    if (postType === 'video') {
      pushUrl(thumbnail);
      pushUrl(ogp);
    } else {
      pushUrl(thumbnail);
      existingImages.forEach((url) => pushUrl(url));
      selectedImages.forEach((file) => pushUrl(URL.createObjectURL(file)));
      pushUrl(ogp);
    }

    return urls;
  }, [postType, thumbnail, ogp, existingImages, selectedImages]);

  // 現在のインデックスに応じた画像種類のラベルを取得する関数
  const getImageLabel = (index: number): string => {
    if (galleryImages.length === 0) return '';

    const currentUrl = galleryImages[index];

    // サムネイルの場合
    if (currentUrl === thumbnail) return 'サムネイル';

    // OGP画像の場合
    if (currentUrl === ogp) return 'OGP画像';

    // 既存の本編画像の場合
    const existingImageIndex = existingImages.findIndex((url) => url === currentUrl);
    if (existingImageIndex !== -1) {
      return existingImages.length > 1 ? `本編画像 ${existingImageIndex + 1}` : '本編画像';
    }

    // 新規追加の本編画像の場合
    const newImageIndex = selectedImages.findIndex(
      (file) => URL.createObjectURL(file) === currentUrl
    );
    if (newImageIndex !== -1) {
      const totalImageCount = existingImages.length + selectedImages.length;
      const imageNumber = existingImages.length + newImageIndex + 1;
      return totalImageCount > 1 ? `本編画像 ${imageNumber}` : '本編画像';
    }

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
        // 既に選択されている場合は削除
        newCategories = prev.filter((id) => id !== categoryId);
      } else {
        // 新しく選択する場合、最大5つまで
        if (prev.length >= SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT) {
          // 最大数に達している場合はアラート表示
          setIsAlertOpen(true);
          setAlertTitle('カテゴリー選択エラー');
          setAlertDescription(
            `カテゴリーは最大${SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT}つまで選択できます`
          );
          return prev;
        }
        newCategories = [...prev, categoryId];
      }

      // formData.genresを更新
      updateFormData('genres', newCategories);
      return newCategories;
    });
  };

  // 変更検知ロジック（コンテンツが変更されたかどうか）
  const hasContentChanged = useMemo(() => {
    if (!initialFormData) return false;

    // フォームデータの変更をチェック
    const formChanged =
      formData.description !== initialFormData.description ||
      formData.tags !== initialFormData.tags ||
      JSON.stringify(formData.genres) !== JSON.stringify(initialFormData.genres) ||
      formData.singlePrice !== initialFormData.singlePrice ||
      formData.single !== initialFormData.single ||
      formData.plan !== initialFormData.plan ||
      JSON.stringify(selectedPlanId) !== JSON.stringify(initialFormData.plan_ids);

    // メディアファイルの変更をチェック
    const mediaChanged =
      selectedMainFile !== null ||
      selectedSampleFile !== null ||
      selectedImages.length > 0 ||
      deletedImageIds.length > 0 ||
      ogpFile !== null ||
      isOgpDeleted ||
      isThumbnailChanged;

    return formChanged || mediaChanged;
  }, [
    initialFormData,
    formData,
    selectedPlanId,
    selectedMainFile,
    selectedSampleFile,
    selectedImages,
    deletedImageIds,
    ogpFile,
    isOgpDeleted,
    isThumbnailChanged
  ]);

  // カテゴリー削除処理
  const handleCategoryRemove = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.filter((id) => id !== categoryId);
      // formData.genresを更新
      updateFormData('genres', newCategories);
      return newCategories;
    });
  };

  // 投稿更新処理
  const handleSubmitPost = async () => {
    // エラーメッセージをクリア
    setError({ show: false, messages: [] });

    const errorMessages = [] as string[];
    
    // バリデーション
    // 動画投稿の場合、メイン動画が必須（既存のメイン動画がない場合）
    if (postType === 'video' && !selectedMainFile && !existingMainVideoUrl) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.MAIN_VIDEO_REQUIRED);
    }

    // 動画投稿の場合、サンプル動画が必須（既存のサンプル動画がない場合）
    if (postType === 'video' && !selectedSampleFile && !previewSampleUrl && !existingSampleVideoUrl) {
      errorMessages.push('サンプル動画を設定してください');
    }

    // 画像投稿の場合、画像が必須（既存の画像がない場合）
    if (postType === 'image' && selectedImages.length === 0 && existingImages.length === 0) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.IMAGE_REQUIRED);
    }
    
    // 説明文のバリデーション
    if (!formData.description.trim()) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.DESCRIPTION_REQUIRED);
    }
    
    // 確認項目のバリデーション
    if (!allChecked) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.CONFIRMATION_REQUIRED);
    }

    // 予約投稿のバリデーション
    if (formData.scheduled && !formData.formattedScheduledDateTime) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_DATETIME_REQUIRED);
    }

    // 公開期限のバリデーション
    if (formData.expiration && !formData.expirationDate) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.EXPIRATION_DATE_REQUIRED);
    }

    // 予約日時・公開期限日が過去日付でないことのバリデーション
    if (
      (formData.scheduled && formData.formattedScheduledDateTime && new Date(formData.formattedScheduledDateTime) <= new Date()) ||
      (formData.expiration && formData.expirationDate && new Date(formData.expirationDate) <= new Date())
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_EXPIRATION_DATETIME_ERROR);
    }

    // 予約日時が公開期限日より後でないことのバリデーション
    if (
      formData.scheduled &&
      formData.expiration &&
      formData.formattedScheduledDateTime &&
      formData.expirationDate &&
      new Date(formData.formattedScheduledDateTime) > new Date(formData.expirationDate)
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SCHEDULED_MORETHAN_EXPIRATION_DATETIME_ERROR);
    }

    // プランまたは単品販売のどちらかが選択されている必要がある
    if (!formData.single && !formData.plan) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_ERROR);
    }

    // プランが選択されている場合、プランIDが必須
    if (formData.plan && (!formData.plan_ids || formData.plan_ids.length === 0)) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.PLAN_REQUIRED);
    }

    // 単品販売が選択されている場合、単品価格が必須
    if (formData.single && !formData.singlePrice) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.SINGLE_PRICE_REQUIRED);
    }

    // カテゴリーのバリデーション（1つ以上、最大5つまで）
    if (
      formData.genres.length === 0 ||
      formData.genres.length > SHARE_VIDEO_CONSTANTS.CATEGORY_COUNT
    ) {
      errorMessages.push(SHARE_VIDEO_VALIDATION_MESSAGES.CATEGORY_REQUIRED);
    }

    // メイン動画変更時のサンプル動画バリデーション
    // 削除: メイン動画のみ変更する場合もエラーを出さない仕様に変更

    // エラーメッセージがある場合は表示して処理を中断
    if (errorMessages.length > 0) {
      setError({ show: true, messages: errorMessages });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setOverallProgress(0);

    try {
      setOverallProgress(10);

      // OGP画像が削除された場合は削除APIを呼び出す
      if (isOgpDeleted && existingOgpId) {
        await deleteMediaAsset(existingOgpId);
      }

      setOverallProgress(20);

      // 新しいメディアファイルがある場合はアップロード処理
      if (
        selectedMainFile ||
        selectedSampleFile ||
        selectedImages.length > 0 ||
        deletedImageIds.length > 0 ||
        ogpFile || // 新しいOGP画像がある
        isThumbnailChanged // サムネイルが変更された
      ) {
        let imagePresignedUrl, videoPresignedUrl, imagesPresignedUrl;
        try {
          const presignedUrls = await getPresignedUrl(postId!);
          imagePresignedUrl = presignedUrls.imagePresignedUrl;
          videoPresignedUrl = presignedUrls.videoPresignedUrl;
          imagesPresignedUrl = presignedUrls.imagesPresignedUrl;
        } catch (error) {
          console.error('Presigned URL取得エラー:', error);
          setUploadMessage('ファイルアップロードに失敗しました。時間をおいて再試行してください。');
          setUploading(false);
          return;
        }
        setOverallProgress(30);

        // ファイル数をカウント
        let totalFiles = 0;
        let uploadedFiles = 0;

        if (postType === 'video') {
          if (selectedMainFile) totalFiles++;
          if (selectedSampleFile || (previewSampleUrl && !previewSampleUrl.startsWith('http')))
            totalFiles++;
          if (thumbnail && isThumbnailChanged) totalFiles++;
          if (ogpFile) totalFiles++; // 新しいOGP画像
        } else {
          totalFiles = selectedImages.length;
          if (thumbnail && isThumbnailChanged) totalFiles++;
          if (ogpFile) totalFiles++; // 新しいOGP画像
        }

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
          // メイン動画とサンプル動画の処理
          if (selectedMainFile && tempVideoS3Key) {
            // メイン動画のアスペクト比を取得
            const mainOrientation = await getAspectRatio(selectedMainFile);

            // サンプル動画のアスペクト比を取得
            let sampleOrientation: 'portrait' | 'landscape' | 'square' | undefined;
            if (isSample === 'upload' && selectedSampleFile) {
              // アップロードモード: サンプル動画ファイルから取得
              sampleOrientation = await getAspectRatio(selectedSampleFile);
            } else if (isSample === 'cut_out') {
              // カットアウトモード: メイン動画と同じアスペクト比を使用
              sampleOrientation = mainOrientation;
            }

            // バッチ処理をトリガー（既存メディアアセットはバックエンド側で上書き）
            // メイン動画変更時、既存のcut_outデータは送信しない（サンプル動画が再設定された場合のみ送信）
            const shouldSendCutOutData = isSample === 'cut_out' && isSampleReconfigured;

            await triggerBatchProcess({
              post_id: postId,
              tmp_storage_key: tempVideoS3Key,
              need_trim: shouldSendCutOutData,
              start_time: shouldSendCutOutData ? sampleStartTime : undefined,
              end_time: shouldSendCutOutData ? sampleEndTime : undefined,
              main_orientation: mainOrientation,
              sample_orientation: shouldSendCutOutData ? sampleOrientation : undefined,
              content_type: selectedMainFile?.type as FileSpec['content_type'],
            });
          }

          // サンプル動画のuploadモードの場合のみpresignedURLでアップロード
          if (selectedSampleFile && isSample === 'upload' && videoPresignedUrl?.uploads?.sample) {
            await uploadFile(selectedSampleFile, 'sample', videoPresignedUrl.uploads.sample);
          }

          if (thumbnail && isThumbnailChanged && imagePresignedUrl?.uploads?.thumbnail) {
            const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
            const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', {
              type: 'image/jpeg',
            });
            await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
          }

          // OGP画像のアップロード: 新しい画像が選択された場合のみ
          if (ogpFile && imagePresignedUrl?.uploads?.ogp) {
            await uploadFile(ogpFile, 'ogp', imagePresignedUrl.uploads.ogp);
          }
        } else if (postType === 'image') {
          // 新しい画像専用APIを使用した場合
          if (selectedImages.length > 0 && imagesPresignedUrl?.uploads) {
            for (
              let i = 0;
              i < selectedImages.length && i < imagesPresignedUrl.uploads.length;
              i++
            ) {
              await uploadFile(selectedImages[i], 'images', imagesPresignedUrl.uploads[i]);
            }
          }

          if (thumbnail && isThumbnailChanged && imagePresignedUrl?.uploads?.thumbnail) {
            const thumbnailBlob = await fetch(thumbnail).then((r) => r.blob());
            const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', {
              type: 'image/jpeg',
            });
            await uploadFile(thumbnailFile, 'thumbnail', imagePresignedUrl.uploads.thumbnail);
          }

          // OGP画像のアップロード: 新しい画像が選択された場合のみ
          if (ogpFile && imagePresignedUrl?.uploads?.ogp) {
            await uploadFile(ogpFile, 'ogp', imagePresignedUrl.uploads.ogp);
          }
        }
      }

      const updatePostRequest: UpdatePostRequest = {
        post_id: postId!,
        description: formData.description,
        category_ids: formData.genres,
        tags: formData.tags,
        scheduled: formData.scheduled,
        formattedScheduledDateTime: formData.formattedScheduledDateTime
          ? new Date(formData.formattedScheduledDateTime)
          : undefined,
        expiration: formData.expiration,
        expirationDate: formData.expirationDate,
        plan: plan,
        plan_ids: selectedPlanId.length > 0 ? selectedPlanId : undefined,
        single: single,
        price: single && formData.singlePrice ? parseFloat(formData.singlePrice) : undefined,
        post_type: postType,
      };

      // メタデータの更新
      await updatePost(updatePostRequest);

      setOverallProgress(100);
      setUploadMessage('投稿の更新が完了しました！');

      // 完了メッセージを少し表示してからナビゲート
      setTimeout(() => {
        setUploading(false);
        navigate(`/account/post`);
      }, 1500);
    } catch (error) {
      console.error('更新エラー:', error);
      setUploadMessage('更新に失敗しました。時間をおいて再試行してください。');
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
    try {
      const imageFiles = [];
      // サムネイル: 変更された場合のみアップロード
      if (thumbnail && isThumbnailChanged) {
        imageFiles.push({
          post_id: postId,
          kind: 'thumbnail' as const,
          content_type: 'image/jpeg' as FileSpec['content_type'],
          ext: 'jpg' as const,
          orientation: 'square' as const,
        });
      }

      // OGP画像: 新しいファイルが選択された場合のみ
      if (ogpFile) {
        imageFiles.push({
          post_id: postId,
          kind: 'ogp' as const,
          content_type: 'image/jpeg' as FileSpec['content_type'],
          ext: 'jpg' as const,
          orientation: 'square' as const,
        });
      }

      let imagePresignedUrl = null;
      let videoPresignedUrl = null;
      let imagesPresignedUrl = null;

      // 画像投稿タイプの場合: 専用のupdateImages APIを使用
      if (postType === 'image') {
        // 既存画像が削除されたか、新しい画像が追加されたかをチェック
        const hasImageChanges = deletedImageIds.length > 0 || selectedImages.length > 0;

        if (hasImageChanges) {
          const addImages = [];
          for (const image of selectedImages) {
            const aspectRatio = await getAspectRatio(image);
            addImages.push({
              kind: 'images' as const,
              content_type: image.type as FileSpec['content_type'],
              ext: mimeToImageExt(image.type),
              orientation: aspectRatio,
            });
          }

          const updateImagesRequest: UpdateImagesPresignedUrlRequest = {
            post_id: postId,
            add_images: addImages,
            delete_image_ids: deletedImageIds, // 削除対象の画像ID一覧
          };

          imagesPresignedUrl = await updateImages(updateImagesRequest);
        }
      }

      // サムネイルやOGPがある場合
      const imagePresignedUrlRequest: PutImagePresignedUrlRequest = {
        post_id: postId,
        files: imageFiles,
      };

      if (imagePresignedUrlRequest.files.length > 0) {
        imagePresignedUrl = await putImagePresignedUrl(imagePresignedUrlRequest);
      }

      const videoFiles = [];

      // メイン動画はバッチ処理を使用するため、presigned URLは不要
      // uploadTempMainVideo → triggerBatchProcessのフローで処理

      // サンプル動画: uploadモードの場合のみpresigned URLを生成
      if (postType === 'video' && selectedSampleFile && isSample === 'upload') {
        // アップロードモード: ローカルファイルから取得
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
      // cut_outモードの場合はバッチ処理で対応するため、ここではpresigned URLを生成しない

      const videoPresignedUrlRequest: PutVideoPresignedUrlRequest = {
        post_id: postId,
        files: videoFiles,
      };

      if (videoPresignedUrlRequest.files.length > 0) {
        videoPresignedUrl = await putVideoPresignedUrl(videoPresignedUrlRequest);
      }

      return {
        imagePresignedUrl,
        videoPresignedUrl,
        imagesPresignedUrl, // 画像専用のpresigned URL
      };
    } catch (error) {
      console.error('プレシジョンURL取得エラー:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <CommonLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <div className="bg-white min-h-screen">
      {/* <Header /> */}
      <div className="flex items-center p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className='w-10 flex justify-center'>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center w-full justify-center">
          <h1 className="text-xl font-semibold bg-white text-center">
            投稿編集
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {console.log('click');}} className='w-10 flex justify-center cursor-none' disabled>
        </Button>
      </div>

      {/* 投稿タイプ表示（切り替え不可） */}
      <div className="flex bg-gray-100 pt-3 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            postType === 'video' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
          }`}
        >
          動画投稿
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            postType === 'image' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
          }`}
        >
          画像投稿
        </button>
      </div>

      {/* 拒否理由メッセージ（REJECTED状態の場合） */}
      {postStatus === POST_STATUS.REJECTED && (postRejectComments || mediaAssetRejectComments.length > 0) && (
        <div className="px-5 py-3">
          <ErrorMessage
            message={[
              ...(postRejectComments ? [`投稿: ${postRejectComments}`] : []),
              ...mediaAssetRejectComments.map((item) => `${getMediaKindLabel(item.kind)}: ${item.message}`)
            ]}
            variant="warning"
          />
        </div>
      )}

      {/* バリデーションエラーメッセージ */}
      {error.show && error.messages.length > 0 && (
        <div className="px-5 py-3">
          <ErrorMessage
            message={error.messages}
            variant="error"
            onClose={() => setError({ show: false, messages: [] })}
          />
        </div>
      )}
      {postType === 'video' ? (
        <>
          {/* 公開済みの場合はメイン動画・サンプル動画セクションを非表示 */}
          {postStatus !== POST_STATUS.APPROVED && (
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
                uploadingProgress={uploadingMainVideoProgress}
                onFileChange={handleMainVideoChange}
                onThumbnailChange={handleThumbnailChange}
                onRemove={removeVideo}
              />

              {(selectedMainFile || previewMainUrl) && (
                <>
                  {/* サンプル動画セクション */}
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
                </>
              )}
            </>
          )}

          {/* 公開済み・非公開の場合のサムネイルセクション */}
          {(postStatus === POST_STATUS.APPROVED || postStatus === POST_STATUS.UNPUBLISHED) && (
            <ThumbnailSection
              thumbnail={thumbnail}
              uploadProgress={uploadProgress.thumbnail}
              onThumbnailChange={handleThumbnailChange}
              onRemove={() => setThumbnail(null)}
            />
          )}

          {/* OGP画像セクション - 公開済み・非公開でも表示 */}
          {(selectedMainFile || previewMainUrl || postStatus === POST_STATUS.APPROVED || postStatus === POST_STATUS.UNPUBLISHED) && (
            <OgpImageSection
              ogp={ogp}
              onFileChange={handleOgpChange}
              onRemove={handleOgpRemove}
            />
          )}
        </>
      ) : (
        <>
          {/* 公開済み・非公開の場合は画像投稿セクションを非表示 */}
          {postStatus !== POST_STATUS.APPROVED && postStatus !== POST_STATUS.UNPUBLISHED && (
            <>
              {/* 画像投稿セクション */}
              <ImagePostSection
                selectedImages={selectedImages}
                uploading={uploading}
                uploadProgress={uploadProgress}
                uploadMessage={uploadMessage}
                onFileChange={handleImageChange}
                onRemove={removeImage}
                existingImages={existingImages}
                onRemoveExistingImage={removeExistingImage}
                onImageClick={openImageModal}
              />
            </>
          )}

          {/* サムネイル設定セクション - 常に表示 */}
          <ThumbnailSection
            thumbnail={thumbnail}
            uploadProgress={uploadProgress.thumbnail}
            onThumbnailChange={handleThumbnailChange}
            onRemove={() => setThumbnail(null)}
          />

          {/* OGP画像セクション - 常に表示 */}
          <OgpImageSection ogp={ogp} onFileChange={handleOgpChange} onRemove={handleOgpRemove} />
        </>
      )}

      {/* 説明文セクション */}
      <DescriptionSection
        description={formData.description}
        onChange={(value) => updateFormData('description', value)}
        onNgWordsDetected={setHasNgWords}
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
        isScheduledDisabled={isScheduledDisabled}
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
            confirm4: checked,
          })
        }
      />

      {/* 更新ボタン */}
      <div className="border-b border-gray-200">
        <div className="m-4">
          <Button
            onClick={handleSubmitPost}
            disabled={!allChecked || uploading || hasNgWords || !hasContentChanged}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            更新する
          </Button>
          <FooterSection />
        </div>
      </div>

      {/* 動画トリミングモーダル */}
      {showTrimModal && previewMainUrl && (
        <VideoTrimModal
          isOpen={showTrimModal}
          videoUrl={previewMainUrl}
          onClose={() => setShowTrimModal(false)}
          onComplete={handleTrimComplete}
        />
      )}
      <Alert
        isOpen={isAlertOpen}
        title={alertTitle}
        description={alertDescription}
        onClose={() => setIsAlertOpen(false)}
      />

      {/* アップロード進捗モーダル */}
      <UploadProgressModal
        isOpen={uploading}
        progress={overallProgress}
        title="更新中"
        message={uploadMessage || 'ファイルをアップロード中です...'}
      />

      {/* 画像ギャラリーモーダル */}
      <ImageGalleryModal
        isOpen={showImageGallery}
        images={galleryImages}
        currentIndex={currentImageIndex}
        onClose={() => setShowImageGallery(false)}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
        getImageLabel={getImageLabel}
      />
      </div>

      <BottomNavigation />
    </CommonLayout>
  );
}
