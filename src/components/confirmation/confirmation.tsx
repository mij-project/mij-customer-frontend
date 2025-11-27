import { useAgeVerification } from '@/contexts/AgeVerificationContext';

export default function Confirmation() {
  const { verifyAge } = useAgeVerification();

  const handleAgeConfirmation = () => {
    verifyAge();
  };

  const handleAgeRejection = () => {
    // 年齢が18歳未満の場合、サイトから離脱
    window.location.href = 'about:blank';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">mijfans</h1>
        </div>

        {/* Age verification warning */}
        <div className="mb-8">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">年齢確認</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              このコンテンツは18歳以上の方を対象としています。
              <br />
              あなたは18歳以上ですか？
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAgeConfirmation}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-4 px-4 rounded-2xl text-base transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              はい
            </button>
            <button
              onClick={handleAgeRejection}
              className="flex-1 border-2 border-primary text-primary font-semibold py-4 px-4 rounded-2xl text-base transition-all duration-200 hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]"
            >
              いいえ
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-500 leading-relaxed">
          <p>18歳未満の方はご利用いただけません。</p>
        </div>
      </div>
    </div>
  );
}
