import AccountHeader from '@/features/account/components/AccountHeader';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader
        title="お問い合わせ"
        showBackButton={true}
        onBack={() => navigate('/account/settings')}
      />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <p className="font-bold text-md text-gray-600">
            mijfansへのご質問・ご要望は、妄想の種からチャットで運営にお問い合わせ可能です。
          </p>
          <br />
          <br />

          <p className="font-bold text-md text-gray-600">メールでのお問い合わせはこちら</p>
          <a href="mailto:support@mijfans.jp" className="text-blue-500 underline">
            support@mijfans.jp
          </a>
          <p className="text-xs text-gray-600">※電話でのお問い合わせは受け付けておりません。</p>
        </div>
      </div>
    </div>
  );
}
