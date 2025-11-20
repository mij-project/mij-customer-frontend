import { useEffect, useState } from 'react';
import AccountHeader from '@/features/account/components/AccountHeader';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { getUserSettings, updateUserSettings } from '@/api/endpoints/user_settings';
import { UserSettingsType } from '@/api/types/user_settings';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function AccountSettingEmailNotification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    show: false,
    message: '',
  });
  const [settings, setSettings] = useState({
    follow: true,
    postLike: true,
    postApprove: true,
    profileApprove: true,
    identityApprove: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError({ show: false, message: '' });
      try {
        const response = await getUserSettings(UserSettingsType.email);
        if (response.status !== 200) {
          throw new Error('ユーザー設定の取得に失敗しました');
        }
        if (
          response.data.id &&
          JSON.stringify(response.data.settings) !== JSON.stringify(settings)
        ) {
          setSettings((prev) => ({ ...prev, ...response.data.settings }));
        } else {
          return;
        }
      } catch (error) {
        console.log('ユーザー設定の取得エラー:', error);
        setError({ show: true, message: 'ユーザー設定の取得に失敗しました' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleEmailNotificationChange = async (key: string, checked: boolean) => {
    setLoading(true);
    setError({ show: false, message: '' });
    try {
      const response = await updateUserSettings(UserSettingsType.email, {
        ...settings,
        [key]: checked,
      });
      if (response.status !== 200) {
        throw new Error('ユーザー設定の更新に失敗しました');
      }
      setSettings((prev) => ({ ...prev, [key]: checked }));
    } catch (error) {
      console.log('ユーザー設定の更新エラー:', error);
      setError({ show: true, message: 'ユーザー設定の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="メール・通知設定"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      {error.show && <ErrorMessage message={error.message} variant="error" />}
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">メール・通知設定</h2>
          <p className="text-sm text-gray-600">メール・通知設定</p>
        </div>
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <Label htmlFor="follow" className="text-sm font-medium text-gray-700">
              フォローの通知
            </Label>
            <Switch
              id="follow"
              checked={settings.follow}
              onCheckedChange={(checked) => handleEmailNotificationChange('follow', checked)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="postLike" className="text-sm font-medium text-gray-700">
              投稿いいねの通知
            </Label>
            <Switch
              id="postLike"
              checked={settings.postLike}
              onCheckedChange={(checked) => handleEmailNotificationChange('postLike', checked)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="postApprove" className="text-sm font-medium text-gray-700">
              投稿承認・拒否の通知
            </Label>
            <Switch
              id="postApprove"
              checked={settings.postApprove}
              onCheckedChange={(checked) => handleEmailNotificationChange('postApprove', checked)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="profileApprove" className="text-sm font-medium text-gray-700">
              プロフィール承認・拒否の通知
            </Label>
            <Switch
              id="profileApprove"
              checked={settings.profileApprove}
              onCheckedChange={(checked) =>
                handleEmailNotificationChange('profileApprove', checked)
              }
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="identityApprove" className="text-sm font-medium text-gray-700">
              本人確認承認・拒否の通知
            </Label>
            <Switch
              id="identityApprove"
              checked={settings.identityApprove}
              onCheckedChange={(checked) =>
                handleEmailNotificationChange('identityApprove', checked)
              }
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
