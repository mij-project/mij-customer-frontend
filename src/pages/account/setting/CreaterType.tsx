import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getGenders } from '@/api/endpoints/gender';
import { createCreatorType } from '@/api/endpoints/creator_type';
import ErrorMessage from '@/components/common/ErrorMessage';
import Header from '@/components/common/Header';
import { getCreatorTypes } from '@/api/endpoints/creator_type';
import AccountHeader from '@/features/account/components/AccountHeader';

export default function CreaterType() {

  const navigate = useNavigate();
  const [creatorTypes, setCreatorTypes] = useState<Array<{ slug: string; name: string }>>([]);
  const [selectedCreatorTypes, setSelectedCreatorTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    show: false,
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 並列取得
        const [genders, currentTypes] = await Promise.all([getGenders(), getCreatorTypes()]);
        // 表示一覧はジェンダーのマスタを使用
        setCreatorTypes(genders);
        // 取得済みのタイプ(slug)が一致するものを初期選択状態にする
        const genderSlugs = new Set(genders.map((g) => g.slug));
        // APIの戻りが ["general","gay"] もしくは [{slug:"general"}, ...] 双方に対応
        const currentTypeSlugs: string[] = Array.isArray(currentTypes)
          ? (currentTypes as any[]).map((t) => (typeof t === 'string' ? t : t?.slug)).filter(Boolean)
          : [];
        const matchedSlugs = currentTypeSlugs.filter((slug) => genderSlugs.has(slug));
        setSelectedCreatorTypes(matchedSlugs);
      } catch (err) {
        console.error('Failed to fetch creator types or genders:', err);
        setError({
          show: true,
          message: 'ジャンル情報の取得に失敗しました',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleCreatorType = (slug: string) => {
    setSelectedCreatorTypes((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  const handleCreatorTypeSelectionComplete = async (gender_slugs: string[]) => {
    setSelectedCreatorTypes(gender_slugs);
    try {
      // クリエイター登録APIを呼び出す
      const response = await createCreatorType(gender_slugs);
      if (response.result) {
        navigate('/account/setting');
      } else {
        alert('クリエイター申請に失敗しました。もう一度お試しください。');
      }
      navigate('/');
    } catch (error) {
      console.error('Creator registration error:', error);
      alert('クリエイター申請に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="w-full max-w-screen-md min-h-screen mx-auto bg-white space-y-6 pt-16">
      <AccountHeader title="クリエイタータイプ" showBackButton={true} onBack={() => navigate('/account/settings')} />
      <div className="min-h-screen px-4 py-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <h1 className="text-lg font-bold flex-1 mr-8">クリエイタージャンル登録</h1>
        </div>
        {/* 説明文 */}
        <div className="mb-6">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            あなたが活動するジャンルを選択してください。
          </p>
          <p className="text-xs text-gray-500">※複数選択可能です</p>
        </div>
        {/* ジャンル選択 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error.show ? (
          <ErrorMessage message={error.message} variant="error" />
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-24">
            {creatorTypes.map((creatorType) => (
              <button
                key={creatorType.slug}
                onClick={() => handleToggleCreatorType(creatorType.slug)}
                className={`p-4 rounded-xl font-semibold transition-all ${selectedCreatorTypes.includes(creatorType.slug)
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {creatorType.name}
              </button>
            ))}
          </div>
        )}
        {/* 次へボタン（固定） */}
        <div className="fixed bottom-20 left-0 right-0 px-4 py-4  border-gray-200">
          <div className="max-w-screen-md mx-auto">
            <button
              onClick={() => handleCreatorTypeSelectionComplete(selectedCreatorTypes)}
              disabled={selectedCreatorTypes.length === 0 || loading}
              className={`w-full py-4 px-6 rounded-full font-semibold transition-all ${selectedCreatorTypes.length > 0 && !loading
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <CommonLayout header={true}>
  //     <Header />
  //     <div className="min-h-screen px-4 py-6">
  //       {/* ヘッダー */}
  //       <div className="flex items-center mb-6">
  //         <button onClick={() => navigate(-1)} className="p-2">
  //           <ChevronLeft className="h-6 w-6" />
  //         </button>
  //         <h1 className="text-lg font-bold flex-1 text-center mr-8">クリエイタージャンル登録</h1>
  //       </div>
  //       {/* 説明文 */}
  //       <div className="mb-6">
  //         <p className="text-sm text-gray-700 leading-relaxed mb-4">
  //           あなたが活動するジャンルを選択してください。
  //         </p>
  //         <p className="text-xs text-gray-500">※複数選択可能です</p>
  //       </div>
  //       {/* ジャンル選択 */}
  //       {loading ? (
  //         <div className="flex items-center justify-center py-12">
  //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //         </div>
  //       ) : error.show ? (
  //         <ErrorMessage message={error.message} variant="error" />
  //       ) : (
  //         <div className="grid grid-cols-2 gap-3 mb-24">
  //           {creatorTypes.map((creatorType) => (
  //             <button
  //               key={creatorType.slug}
  //               onClick={() => handleToggleCreatorType(creatorType.slug)}
  //               className={`p-4 rounded-xl font-semibold transition-all ${selectedCreatorTypes.includes(creatorType.slug)
  //                 ? 'bg-primary text-white shadow-lg'
  //                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  //                 }`}
  //             >
  //               {creatorType.name}
  //             </button>
  //           ))}
  //         </div>
  //       )}
  //       {/* 次へボタン（固定） */}
  //       <div className="fixed bottom-20 left-0 right-0 px-4 py-4  border-gray-200">
  //         <div className="max-w-screen-md mx-auto">
  //           <button
  //             onClick={() => handleCreatorTypeSelectionComplete(selectedCreatorTypes)}
  //             disabled={selectedCreatorTypes.length === 0 || loading}
  //             className={`w-full py-4 px-6 rounded-full font-semibold transition-all ${selectedCreatorTypes.length > 0 && !loading
  //               ? 'bg-primary text-white hover:bg-primary/90'
  //               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  //               }`}
  //           >
  //             次へ
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //     <BottomNavigation />
  //   </CommonLayout>
  // );
}
