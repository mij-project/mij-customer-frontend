import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Check } from 'lucide-react';
import { getPlans, createPlan } from '@/api/endpoints/plans';
import { Plan, PlanCreateRequest } from '@/api/types/plan';
import { ErrorMessage } from '@/components/common';
import { NG_WORDS } from '@/constants/ng_word';

interface PlanSelectorProps {
  selectedPlanId?: string[];
  onPlanSelect: (planId: string, planName?: string) => void;
  onClose: () => void;
}

interface ErrorState {
  show: boolean;
  messages: string[];
}

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_WELCOME_MESSAGE_LENGTH = 1000;

export default function PlanSelector({ selectedPlanId, onPlanSelect, onClose }: PlanSelectorProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ show: false, messages: [] });
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const welcomeMessageRef = useRef<HTMLTextAreaElement>(null);
  const [createFormData, setCreateFormData] = useState<PlanCreateRequest>({
    name: '',
    description: '',
    price: 0,
    open_dm_flg: false,
    welcome_message: '',
  });

  // リアルタイムNG word検出 - プラン名
  const detectedNgWordsInName = useMemo(() => {
    if (!createFormData.name) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (createFormData.name.toLowerCase().includes(word.toLowerCase())) {
        if (!found.includes(word)) {
          found.push(word);
        }
      }
    });
    return found;
  }, [createFormData.name]);

  // リアルタイムNG word検出 - 説明
  const detectedNgWordsInDescription = useMemo(() => {
    if (!createFormData.description) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (createFormData.description.toLowerCase().includes(word.toLowerCase())) {
        if (!found.includes(word)) {
          found.push(word);
        }
      }
    });
    return found;
  }, [createFormData.description]);

  // リアルタイムNG word検出 - ウェルカムメッセージ
  const detectedNgWordsInWelcomeMessage = useMemo(() => {
    if (!createFormData.welcome_message) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (createFormData.welcome_message!.toLowerCase().includes(word.toLowerCase())) {
        if (!found.includes(word)) {
          found.push(word);
        }
      }
    });
    return found;
  }, [createFormData.welcome_message]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await getPlans();
      setPlans(response.plans);
    } catch (error) {
      console.error('プラン取得エラー:', error);
    }
  };

  // Auto-expand textarea
  const autoExpandTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce max length
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setCreateFormData({ ...createFormData, description: value });
      autoExpandTextarea(descriptionRef.current);
    }
    if (error.show) {
      setError({ show: false, messages: [] });
    }
  };

  const handleWelcomeMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce max length
    if (value.length <= MAX_WELCOME_MESSAGE_LENGTH) {
      setCreateFormData({ ...createFormData, welcome_message: value });
      autoExpandTextarea(welcomeMessageRef.current);
    }
    if (error.show) {
      setError({ show: false, messages: [] });
    }
  };

  const handleCreatePlan = async () => {
    const errorMessages: string[] = [];

    // バリデーション
    if (!createFormData.name.trim()) {
      errorMessages.push('プラン名を入力してください');
    }
    if (!createFormData.description.trim()) {
      errorMessages.push('説明を入力してください');
    }
    if (
      createFormData.price === undefined ||
      createFormData.price === null ||
      createFormData.price < 0
    ) {
      errorMessages.push('月額料金を入力してください');
    }
    if (createFormData.price > 50000) {
      errorMessages.push('月額料金は50,000円まで設定できます');
    }

    // NG word validation for name
    if (detectedNgWordsInName.length > 0) {
      errorMessages.push(
        `プラン名に禁止ワードが含まれています: ${detectedNgWordsInName.join(', ')}`
      );
    }

    // NG word validation for description
    if (detectedNgWordsInDescription.length > 0) {
      errorMessages.push(
        `説明に禁止ワードが含まれています: ${detectedNgWordsInDescription.join(', ')}`
      );
    }

    // NG word validation for welcome message (if provided)
    if (detectedNgWordsInWelcomeMessage.length > 0) {
      errorMessages.push(
        `ウェルカムメッセージに禁止ワードが含まれています: ${detectedNgWordsInWelcomeMessage.join(', ')}`
      );
    }

    if (errorMessages.length > 0) {
      setError({ show: true, messages: errorMessages });
      return;
    }

    setError({ show: false, messages: [] });
    setLoading(true);
    try {
      // Remove empty fields
      const planData: PlanCreateRequest = {
        ...createFormData,
        welcome_message: createFormData.welcome_message?.trim() || undefined,
      };
      const newPlan = await createPlan(planData);
      setPlans([...plans, newPlan]);
      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        description: '',
        price: 0,
        open_dm_flg: false,
        welcome_message: '',
      });
      setError({ show: false, messages: [] });
      onPlanSelect(newPlan.id, newPlan.name);
    } catch (error: any) {
      console.error('プラン作成エラー:', error);
      setError({
        show: true,
        messages: [error.response?.data?.detail || 'プランの作成に失敗しました'],
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((p) => selectedPlanId?.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">プランを選択</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {!showCreateForm ? (
          <>
            {selectedPlanId && selectedPlanId.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{selectedPlanId.length}つのプランを選択中</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlanId?.includes(plan.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onPlanSelect(plan.id, plan.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{plan.name}</h4>
                      <div className="text-sm text-gray-600">
                        {expandedPlanId === plan.id ? (
                          <>
                            <p className="whitespace-pre-wrap">{plan.description}</p>
                            {plan.description && plan.description.length > 100 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPlanId(null);
                                }}
                                className="text-xs text-primary hover:underline mt-1"
                              >
                                折りたたむ
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="line-clamp-2">{plan.description}</p>
                            {plan.description && plan.description.length > 100 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPlanId(plan.id);
                                }}
                                className="text-xs text-primary hover:underline mt-1"
                              >
                                詳細を見る
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        ¥{plan.price.toLocaleString()}/月
                      </p>
                    </div>
                    {selectedPlanId?.includes(plan.id) && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 mb-2">
              <Button onClick={() => setShowCreateForm(true)} className="flex-1" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                新しいプランを作成
              </Button>
              <Button onClick={onClose} className="flex-1">
                完了
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {error.show && error.messages.length > 0 && (
              <ErrorMessage
                message={error.messages}
                variant="error"
                onClose={() => setError({ show: false, messages: [] })}
              />
            )}
            <div>
              <Label htmlFor="plan-name">プラン名 *</Label>
              <Input
                id="plan-name"
                value={createFormData.name}
                onChange={(e) => {
                  setCreateFormData({ ...createFormData, name: e.target.value });
                  if (error.show) {
                    setError({ show: false, messages: [] });
                  }
                }}
                placeholder="プラン名を入力"
              />
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
                <Label htmlFor="plan-description">説明 *</Label>
                <span className="text-xs text-gray-500">
                  {createFormData.description.length} / {MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                ref={descriptionRef}
                id="plan-description"
                value={createFormData.description}
                onChange={handleDescriptionChange}
                placeholder="プランの説明を入力"
                className="resize-none"
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
              <Label htmlFor="plan-price">月額料金 (円) *</Label>
              <Input
                id="plan-price"
                type="number"
                value={createFormData.price === 0 ? '0' : createFormData.price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setCreateFormData({ ...createFormData, price: 0 });
                    if (error.show) {
                      setError({ show: false, messages: [] });
                    }
                    return;
                  }

                  // 数値に変換
                  const numValue = parseInt(value, 10);

                  if (!isNaN(numValue)) {
                    // 負の値は許可しない
                    if (numValue < 0) {
                      setError({
                        show: true,
                        messages: ['月額料金は0円以上で入力してください'],
                      });
                      return;
                    }
                    // 50000円までの制限
                    if (numValue > 50000) {
                      setError({
                        show: true,
                        messages: ['月額料金は50,000円まで設定できます'],
                      });
                      return;
                    }
                    // エラーをクリア
                    if (error.show) {
                      setError({ show: false, messages: [] });
                    }
                    setCreateFormData({ ...createFormData, price: numValue });
                  } else {
                    setCreateFormData({ ...createFormData, price: 0 });
                  }
                }}
                placeholder="0"
                min="0"
                max="50000"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-t border-gray-200">
              <div className="flex-1">
                <Label htmlFor="openDmFlg" className="block text-sm font-medium">
                  DM解放
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  ONにするとこのプランに加入したファンとDMができるようになります
                </p>
              </div>
              <Switch
                id="openDmFlg"
                checked={createFormData.open_dm_flg || false}
                onCheckedChange={(checked) => {
                  setCreateFormData({ ...createFormData, open_dm_flg: checked });
                  if (error.show) {
                    setError({ show: false, messages: [] });
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="welcome-message">ウェルカムメッセージ</Label>
                <span className="text-xs text-gray-500">
                  {(createFormData.welcome_message || '').length} / {MAX_WELCOME_MESSAGE_LENGTH}
                </span>
              </div>
              <Textarea
                ref={welcomeMessageRef}
                id="welcome-message"
                value={createFormData.welcome_message || ''}
                onChange={handleWelcomeMessageChange}
                placeholder="プランに加入したユーザーへのウェルカムメッセージを入力（オプション）"
                className="resize-none"
              />
              {detectedNgWordsInWelcomeMessage.length > 0 && (
                <div className="mt-2">
                  <ErrorMessage
                    message={[
                      `NGワードが検出されました: ${detectedNgWordsInWelcomeMessage.join('、')}`,
                      `検出されたNGワード数: ${detectedNgWordsInWelcomeMessage.length}個`,
                    ]}
                    variant="error"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleCreatePlan}
                disabled={
                  loading ||
                  detectedNgWordsInName.length > 0 ||
                  detectedNgWordsInDescription.length > 0 ||
                  detectedNgWordsInWelcomeMessage.length > 0
                }
                className="flex-1"
              >
                {loading ? '作成中...' : '作成'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({
                    name: '',
                    description: '',
                    price: 0,
                    open_dm_flg: false,
                    welcome_message: '',
                  });
                  setError({ show: false, messages: [] });
                }}
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
