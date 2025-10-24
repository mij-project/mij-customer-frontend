import React, { useState, useEffect } from 'react';
import AccountHeader from '@/features/account/component/AccountHeader';
import { updateAccountInfo, getProfileEditInfo } from '@/api/endpoints/account';
import { AccountPresignedUrlRequest } from '@/api/types/account';
import { accountPresignedUrl } from '@/api/endpoints/account';
import { putToPresignedUrl } from '@/service/s3FileUpload';
import { useNavigate } from 'react-router-dom';
import { mimeToImageExt, getImageUrl } from '@/lib/media';

// 新しいコンポーネントをインポート
import ProfileEditTabs from '@/features/account/AccountEdit/components/ProfileEditTabs';
import BasicInfoTab from '@/features/account/AccountEdit/components/BasicInfoTab';
import ImageUploadTab from '@/features/account/AccountEdit/components/ImageUploadTab';
import { ProfileData, TabType } from '@/features/account/AccountEdit/types';

export default function AccountEdit() {
  const navigate = useNavigate();

  // タブ状態
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  // プロフィールデータ
  const [profileData, setProfileData] = useState<ProfileData>({
    coverImage: '',
    avatar: '',
    name: '',
    id: '',
    description: '',
    links: {
      website: '',
      website2: '',
      twitter: '',
      instagram: '',
      tiktok: '',
      youtube: '',
    }
  });

  // 画像ファイル
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // アップロード進捗
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  // 送信状態
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // プロフィール編集用の情報を取得
  useEffect(() => {
    const fetchProfileEditInfo = async () => {
      try {
        const data = await getProfileEditInfo();
        console.log('Profile Edit Info:', data);

        setProfileData(prev => ({
          ...prev,
          name: data.profile_name || '',
          id: data.username || '',
          avatar: getImageUrl(data.avatar_url),
          coverImage: getImageUrl(data.cover_url),
          description: data.bio || '',
          links: {
            website: data.links?.website || '',
            website2: data.links?.website2 || '',
            twitter: data.links?.twitter || '',
            instagram: data.links?.instagram || '',
            tiktok: data.links?.tiktok || '',
            youtube: data.links?.youtube || '',
          }
        }));
      } catch (error) {
        console.error('Failed to fetch profile edit info:', error);
        setMessage('プロフィール情報の取得に失敗しました');
      }
    };

    fetchProfileEditInfo();
  }, []);

  // プロフィールデータの更新ハンドラー
  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 基本情報の更新
  const handleBasicInfoSubmit = async () => {
    setMessage(null);

    if (!profileData.name || !profileData.id) {
      setMessage('氏名とユーザーネームは必須です');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateAccountInfo({
        name: profileData.name,
        username: profileData.id.replace('@', ''),
        description: profileData.description,
        links: profileData.links,
      });

      if (res.success) {
        setMessage('基本情報が正常に更新されました');
        setTimeout(() => {
          navigate('/account');
        }, 1500);
      } else {
        setMessage('基本情報の更新に失敗しました');
      }
    } catch (error: any) {
      console.error('Failed to update account info:', error);
      setMessage('基本情報の更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // アバター画像の申請
  const handleAvatarSubmit = async () => {
    setMessage(null);

    if (!avatarFile) {
      setMessage('画像を選択してください');
      return;
    }

    setSubmitting(true);
    try {
      // 1) presigned URL取得
      const presignedUrlRequest: AccountPresignedUrlRequest = {
        files: [{
          kind: 'avatar',
          content_type: avatarFile.type as any,
          ext: mimeToImageExt(avatarFile.type),
        }]
      };

      const presignRes = await accountPresignedUrl(presignedUrlRequest);
      const uploadItem = presignRes.uploads['avatar'];

      // 2) S3にアップロード
      await putToPresignedUrl(uploadItem, avatarFile, uploadItem.required_headers, {
        onProgress: (pct) => setAvatarProgress(pct),
      });

      // 3) APIに通知（申請として保存）
      // TODO: 将来的には画像申請用のAPIエンドポイントを作成
      const res = await updateAccountInfo({
        avatar_url: uploadItem.key,
      });

      if (res.success) {
        setMessage('アバター画像が正常に申請されました');
        setAvatarProgress(0);
        setTimeout(() => {
          navigate('/account');
        }, 1500);
      } else {
        setMessage('アバター画像の申請に失敗しました');
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      const status = error?.response?.status;
      if (status === 400 || status === 403) {
        setMessage('URLの有効期限切れかヘッダ不一致です。もう一度やり直してください。');
      } else {
        setMessage('アップロードに失敗しました。時間をおいて再試行してください。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // カバー画像の申請
  const handleCoverSubmit = async () => {
    setMessage(null);

    if (!coverFile) {
      setMessage('画像を選択してください');
      return;
    }

    setSubmitting(true);
    try {
      // 1) presigned URL取得
      const presignedUrlRequest: AccountPresignedUrlRequest = {
        files: [{
          kind: 'cover',
          content_type: coverFile.type as any,
          ext: mimeToImageExt(coverFile.type),
        }]
      };

      const presignRes = await accountPresignedUrl(presignedUrlRequest);
      const uploadItem = presignRes.uploads['cover'];

      // 2) S3にアップロード
      await putToPresignedUrl(uploadItem, coverFile, uploadItem.required_headers, {
        onProgress: (pct) => setCoverProgress(pct),
      });

      // 3) APIに通知（申請として保存）
      // TODO: 将来的には画像申請用のAPIエンドポイントを作成
      const res = await updateAccountInfo({
        cover_url: uploadItem.key,
      });

      if (res.success) {
        setMessage('カバー画像が正常に申請されました');
        setCoverProgress(0);
        setTimeout(() => {
          navigate('/account');
        }, 1500);
      } else {
        setMessage('カバー画像の申請に失敗しました');
      }
    } catch (error: any) {
      console.error('Failed to upload cover:', error);
      const status = error?.response?.status;
      if (status === 400 || status === 403) {
        setMessage('URLの有効期限切れかヘッダ不一致です。もう一度やり直してください。');
      } else {
        setMessage('アップロードに失敗しました。時間をおいて再試行してください。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <AccountHeader title="プロフィールを編集" showBackButton />

      <div className="mt-16">
        {/* タブナビゲーション */}
        <ProfileEditTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* メッセージ表示 */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.includes('成功') || message.includes('申請されました')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* タブコンテンツ */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab
              profileData={profileData}
              onInputChange={handleInputChange}
              onSubmit={handleBasicInfoSubmit}
              submitting={submitting}
            />
          )}

          {activeTab === 'avatar' && (
            <ImageUploadTab
              title="プロフ画像"
              description="プロフィールページの氏名の上方左側のエリアに表示される画像です。"
              imageType="avatar"
              currentImage={profileData.avatar}
              file={avatarFile}
              progress={avatarProgress}
              submitting={submitting}
              onFileSelect={setAvatarFile}
              onSubmit={handleAvatarSubmit}
            />
          )}

          {activeTab === 'cover' && (
            <ImageUploadTab
              title="ヘッダ画像"
              description="プロフィールページの最上部に表示される画像です。推奨サイズは1500x750ピクセルです。"
              imageType="cover"
              currentImage={profileData.coverImage}
              file={coverFile}
              progress={coverProgress}
              submitting={submitting}
              onFileSelect={setCoverFile}
              onSubmit={handleCoverSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
