import AccountHeader from '@/features/account/component/AccountHeader';

export default function Contact() {
  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader title="お問い合わせ" showBackButton={false} />
      <div className="p-6 space-y-6 mt-16">
        <div className="text-left">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            お問い合わせは下記メールアドレスにお願いいたいします
          </h3>
          <h1 className="text-2xl mt-4 font-bold text-gray-600">support@mijfans.jp</h1>
        </div>
      </div>
    </div>
  );
}
