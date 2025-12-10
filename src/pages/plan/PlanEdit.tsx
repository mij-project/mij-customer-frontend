import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommonLayout from '@/components/layout/CommonLayout';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getPlanDetail, updatePlan, getCreatorPostsForPlan } from '@/api/endpoints/plans';
import { CreatorPost } from '@/api/types/plan';
import { ArrowLeft, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { planEditSchema } from '@/utils/validationSchema';
import { NG_WORDS } from '@/constants/ng_word';

export default function PlanEdit() {
  const navigate = useNavigate();
  const { plan_id } = useParams<{ plan_id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState({ show: false, messages: [] });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isRecommended, setIsRecommended] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const [showPostSelectModal, setShowPostSelectModal] = useState(false);
  const [availablePosts, setAvailablePosts] = useState<CreatorPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [tempSelectedPostIds, setTempSelectedPostIds] = useState<string[]>([]);
  const [hasNgWordsInName, setHasNgWordsInName] = useState(false);
  const [hasNgWordsInDescription, setHasNgWordsInDescription] = useState(false);

  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_DESCRIPTION_LENGTH = 1500;

  // プラン名のNGワードチェック
  const detectedNgWordsInName = useMemo(() => {
    if (!name) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (name.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [name]);

  // 概要のNGワードチェック
  const detectedNgWordsInDescription = useMemo(() => {
    if (!description) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (description.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [description]);

  // NGワード検出状態を更新
  useEffect(() => {
    setHasNgWordsInName(detectedNgWordsInName.length > 0);
  }, [detectedNgWordsInName.length]);

  useEffect(() => {
    setHasNgWordsInDescription(detectedNgWordsInDescription.length > 0);
  }, [detectedNgWordsInDescription.length]);

  // 概要のテキストエリアの高さを自動調整
  useEffect(() => {
    if (descriptionTextareaRef.current) {
      descriptionTextareaRef.current.style.height = 'auto';
      descriptionTextareaRef.current.style.height = `${descriptionTextareaRef.current.scrollHeight}px`;
    }
  }, [description]);

  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!plan_id) {
      setError({ show: true, messages: ['プランIDが指定されていません'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setInitialLoading(false);
      return;
    }

    const fetchPlanDetail = async () => {
      try {
        const planData = await getPlanDetail(plan_id);
        setName(planData.name);
        setDescription(planData.description || '');
        setPrice(planData.price);
        setIsRecommended(planData.type === 2 ? true : false);
      } catch (err) {
        console.error('プラン詳細取得エラー:', err);
        setError({ show: true, messages: ['プラン詳細の取得に失敗しました'] });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPlanDetail();
  }, [plan_id]);

  const handleOpenPostSelectModal = async () => {
    if (!plan_id) return;

    setLoadingPosts(true);
    setShowPostSelectModal(true);
    try {
      const response = await getCreatorPostsForPlan(plan_id);
      setAvailablePosts(response.posts);
      const included = response.posts.filter((p) => p.is_included).map((p) => p.id);
      setSelectedPostIds(included);
      setTempSelectedPostIds(included);
    } catch (err) {
      console.error('投稿一覧取得エラー:', err);
      setError({ show: true, messages: ['投稿一覧の取得に失敗しました'] });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostToggle = (postId: string) => {
    setTempSelectedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
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
    const validationData = {
      name: name.trim(),
      description: description.trim(),
      welcome_message: welcomeMessage.trim(),
      post_ids: selectedPostIds,
      type: isRecommended ? 2 : 1,
    };

    const validationRs = planEditSchema.safeParse(validationData);
    if (!validationRs.success) {
      setError({ show: true, messages: validationRs.error.issues.map((issue) => issue.message) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plan_id || !validateForm()) return;

    setLoading(true);
    setError({ show: false, messages: [] });

    try {
      await updatePlan(plan_id, {
        name,
        description,
        type: isRecommended ? 2 : 1,
        welcome_message: welcomeMessage,
        post_ids: selectedPostIds,
      });

      navigate('/account/plan');
    } catch (err: any) {
      console.error('プラン更新エラー:', err);
      setError(err.response?.data?.detail || 'プランの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <CommonLayout header={true}>
        <Header />
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={true}>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 border-b border-gray-200 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">プラン編集</h1>
            </div>
            <Button variant="outline" size="sm" className="text-gray-600" disabled={true}>
            </Button>
          </div>
        </div>
        <div className="max-w mx-auto p-6">
          {error.show && (
            <div className="mb-4">
              <ErrorMessage message={error.messages} variant="error" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
              {detectedNgWordsInName.length > 0 && (
                <div className="mt-2">
                  <ErrorMessage
                    message={[
                      `NGワードが検出されました: ${detectedNgWordsInName.join('、')}`,
                      `検出されたNGワード数: ${detectedNgWordsInName.length}個`,
                    ]}
                    variant="error"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description" className="block">
                  概要
                </Label>
                <span className="text-xs text-gray-500">
                  {description.length} / {MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                ref={descriptionTextareaRef}
                id="description"
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  // 最大文字数を超えないようにする
                  if (value.length <= MAX_DESCRIPTION_LENGTH) {
                    setDescription(value);
                  }
                }}
                placeholder="コンテンツの内容がわかりやすいと、ファンが加入しやすくなります"
                rows={3}
                className="resize-none border border-gray-300 focus:outline-none focus:ring-0 focus:border-primary focus:border-2 shadow-none overflow-hidden min-h-[80px]"
              />
              {detectedNgWordsInDescription.length > 0 && (
                <div className="mt-2">
                  <ErrorMessage
                    message={[
                      `NGワードが検出されました: ${detectedNgWordsInDescription.join('、')}`,
                      `検出されたNGワード数: ${detectedNgWordsInDescription.length}個`,
                    ]}
                    variant="error"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="price" className="block mb-2">
                月額料金
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  ¥
                </span>
                <Input
                  type="number"
                  id="price"
                  value={price}
                  disabled
                  className="pl-10 pr-12 bg-gray-100 cursor-not-allowed"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  /月
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ※ 加入者がいるプランの価格は変更できません
              </p>
            </div>

            {/* <div>
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
            </div> */}

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

            <Button
              type="submit"
              disabled={loading || hasNgWordsInName || hasNgWordsInDescription}
              className="w-full bg-primary text-white py-3 hover:bg-primary/90"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'プランを更新'}
            </Button>
          </form>
        </div>
      </div>

      {showPostSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-t-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
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
