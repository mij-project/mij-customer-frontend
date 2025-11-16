import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getGenders } from '@/api/endpoints/gender';
import { GenderOut } from '@/api/types/gender';
import { registerCreator } from '@/api/endpoints/creator';
import ErrorMessage from '@/components/common/ErrorMessage';
import Header from '@/components/common/Header';

export default function CreaterType() {
  const navigate = useNavigate();
  const [genders, setGenders] = useState<GenderOut[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    show: false,
    message: '',
  });

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        setLoading(true);
        const data = await getGenders();
        setGenders(data);
      } catch (err) {
        console.error('Failed to fetch genders:', err);
        setError({
          show: true,
          message: 'ジャンル情報の取得に失敗しました',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGenders();
  }, []);

  const handleToggleGender = (slug: string) => {
    setSelectedGenders((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  const handleGenreSelectionComplete = async (genders: string[]) => {
    setSelectedGenders(genders);

    try {
      // クリエイター登録APIを呼び出す
      const response = await registerCreator(genders);
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
    <CommonLayout header={true}>
      <Header />
      <div className="min-h-screen px-4 py-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center mr-8">クリエイタージャンル登録</h1>
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
            {genders.map((gender) => (
              <button
                key={gender.slug}
                onClick={() => handleToggleGender(gender.slug)}
                className={`p-4 rounded-xl font-semibold transition-all ${
                  selectedGenders.includes(gender.slug)
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender.name}
              </button>
            ))}
          </div>
        )}
        {/* 次へボタン（固定） */}
        <div className="fixed bottom-20 left-0 right-0 px-4 py-4  border-gray-200">
          <div className="max-w-screen-md mx-auto">
            <button
              onClick={() => handleGenreSelectionComplete(selectedGenders)}
              disabled={selectedGenders.length === 0 || loading}
              className={`w-full py-4 px-6 rounded-full font-semibold transition-all ${
                selectedGenders.length > 0 && !loading
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </CommonLayout>
  );
}
