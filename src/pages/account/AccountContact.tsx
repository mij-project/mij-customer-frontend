import AccountHeader from '@/features/account/component/AccountHeader';

export default function AccountContact() {
  return (
    
    <div className="bg-white mt-16">
      <AccountHeader title="お問い合わせ" showBackButton={false} />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">お問い合わせ</h2>
          <p className="text-sm text-gray-600">お問い合わせ</p>

          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">お問い合わせは下記メールアドレスにお願いいたいします</h3>
          <h1 className="text-2xl mt-4 font-bold text-gray-600">support@mijfans.jp</h1>
        </div>
      </div>
    </div>
  );
}