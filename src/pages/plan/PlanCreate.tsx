import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { createPlan, getCreatorPostsForPlan } from '@/api/endpoints/plans';
import { CreatorPost } from '@/api/types/plan';
import { Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { planCreateSchema } from '@/utils/validationSchema';

export default function PlanCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, messages: [] });

  // フォーム状態
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isRecommended, setIsRecommended] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  // モーダル状態
  const [showPostSelectModal, setShowPostSelectModal] = useState(false);
  const [availablePosts, setAvailablePosts] = useState<CreatorPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [tempSelectedPostIds, setTempSelectedPostIds] = useState<string[]>([]);

  // エラー表示
  // const [nameError, setNameError] = useState('');

  const handleOpenPostSelectModal = async () => {
    setError({ show: false, messages: [] });
    setLoadingPosts(true);
    setShowPostSelectModal(true);
    setError({ show: false, messages: [] });
    try {
      const response = await getCreatorPostsForPlan();
      setAvailablePosts(response.posts);
      setTempSelectedPostIds([...selectedPostIds]);
    } catch (err) {
      console.error('投稿一覧取得エラー:', err);
      setError({ show: true, messages: ['投稿一覧の取得に失敗しました'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostToggle = (postId: string) => {
    if (tempSelectedPostIds.includes(postId)) {
      setTempSelectedPostIds(tempSelectedPostIds.filter((id) => id !== postId));
    } else {
      setTempSelectedPostIds([...tempSelectedPostIds, postId]);
    }
  };

  const handleSavePostSelection = () => {
    setSelectedPostIds([...tempSelectedPostIds]);
    setShowPostSelectModal(false);
  };

  const handleCancelPostSelection = () => {
    setTempSelectedPostIds([...selectedPostIds]);
    setShowPostSelectModal(false);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    const validationData = {
      name: name.trim(),
      description: description.trim(),
      price: price,
      welcome_message: welcomeMessage.trim(),
      post_ids: selectedPostIds,
      type: isRecommended ? 2 : 1,
    };

    const validationRs = planCreateSchema.safeParse(validationData);
    if (!validationRs.success) {
      setError({ show: true, messages: validationRs.error.issues.map((issue) => issue.message) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError({ show: false, messages: [] });

    try {
      await createPlan({
        name,
        description,
        price,
        type: isRecommended ? 2 : 1,
        welcome_message: welcomeMessage,
        post_ids: selectedPostIds,
      });

      navigate('/account/plan');
    } catch (err: any) {
      console.error('プラン作成エラー:', err);
      setError({
        show: true,
        messages: [err.response?.data?.detail || 'プランの作成に失敗しました'],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonLayout header={true}>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">プランを作成</h1>

          {error.show && (
            <div className="mb-4">
              <ErrorMessage message={error.messages} variant="error" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* プラン名 */}
            <div>
              <Label htmlFor="name" className="block mb-2">
                プラン名
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="プラン名を設定してください"
              />
            </div>

            {/* 概要 */}
            <div>
              <Label htmlFor="description" className="block mb-2">
                概要
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="コンテンツの内容がわかりやすいと、ファンが加入しやすくなります"
                rows={4}
              />
            </div>

            {/* 月額料金 */}
            <div>
              <Label htmlFor="price" className="block mb-2">
                月額料金
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500 text-lg">
                  ¥
                </span>
                <Input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  className="pl-10 pr-12"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  /月
                </span>
              </div>
            </div>

            {/* 新規プラン加入者へのメッセージ */}
            <div>
              <Label htmlFor="welcomeMessage" className="block mb-2">
                新規プラン加入者へのメッセージ
              </Label>
              <Textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="ご加入ありがとうございます！これからもよろしくお願いします。"
                rows={4}
              />
            </div>

            {/* プランに含める投稿 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="block">プランに含める投稿 ({selectedPostIds.length}件)</Label>
                <Button
                  type="button"
                  onClick={handleOpenPostSelectModal}
                  variant="secondary"
                  size="sm"
                >
                  投稿を選択
                </Button>
              </div>
            </div>

            {/* おすすめプラン */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isRecommended"
                checked={isRecommended}
                onCheckedChange={(checked) => setIsRecommended(checked === true)}
              />
              <div>
                <Label htmlFor="isRecommended" className="block">
                  このプランをおすすめにする
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  おすすめに設定できるプランは1つのみです。このプランをおすすめに設定すると、現在のおすすめ設定が解除されます。
                </p>
              </div>
            </div>

            {/* プランの作成例はこちら */}
            <div>
              <a href="#" className="text-sm text-gray-600 underline">
                プランの作成例はこちら
              </a>
            </div>

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-gray-900 py-3 hover:bg-yellow-500"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'プランを作成'}
            </Button>
          </form>
        </div>
      </div>

      {/* 投稿選択モーダル */}
      {showPostSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-t-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">プランに含める投稿</h2>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={handleCancelPostSelection}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  破棄
                </Button>
                <Button
                  type="button"
                  onClick={handleSavePostSelection}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  保存
                </Button>
              </div>
            </div>

            {/* モーダルコンテンツ */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : availablePosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">投稿がありません</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {availablePosts.map((post) => (
                      <div
                        key={post.id}
                        className="relative cursor-pointer"
                        onClick={() => handlePostToggle(post.id)}
                      >
                        {/* サムネイル */}
                        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          {post.thumbnail_url ? (
                            <img
                              src={post.thumbnail_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <span className="text-gray-500 text-sm">No Image</span>
                            </div>
                          )}
                          {post.is_video && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white opacity-80" />
                            </div>
                          )}
                          {/* チェックボックス */}
                          <div className="absolute top-2 left-2">
                            <input
                              type="checkbox"
                              checked={tempSelectedPostIds.includes(post.id)}
                              onChange={() => handlePostToggle(post.id)}
                              className="w-5 h-5 text-primary border-white rounded focus:ring-primary cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 選択数表示 */}
                  <div className="text-center text-sm text-gray-600 py-4">
                    {availablePosts.length}件中{tempSelectedPostIds.length}件選択中
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </CommonLayout>
  );
}
