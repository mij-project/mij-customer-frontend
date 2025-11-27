import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check } from 'lucide-react';
import { getPlans, createPlan } from '@/api/endpoints/plans';
import { Plan, PlanCreateRequest } from '@/api/types/plan';
import { ErrorMessage } from '@/components/common';

interface PlanSelectorProps {
  selectedPlanId?: string[];
  onPlanSelect: (planId: string, planName?: string) => void;
  onClose: () => void;
}

interface ErrorState {
  show: boolean;
  messages: string[];
}

export default function PlanSelector({ selectedPlanId, onPlanSelect, onClose }: PlanSelectorProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ show: false, messages: [] });
  const [createFormData, setCreateFormData] = useState<PlanCreateRequest>({
    name: '',
    description: '',
    price: 0,
  });

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

  const handleCreatePlan = async () => {
    const errorMessages: string[] = [];

    // バリデーション
    if (!createFormData.name.trim()) {
      errorMessages.push('プラン名を入力してください');
    }
    if (!createFormData.description.trim()) {
      errorMessages.push('説明を入力してください');
    }
    if (!createFormData.price || createFormData.price <= 0) {
      errorMessages.push('月額料金を入力してください');
    }
    if (createFormData.price > 50000) {
      errorMessages.push('月額料金は50,000円まで設定できます');
    }

    if (errorMessages.length > 0) {
      setError({ show: true, messages: errorMessages });
      return;
    }

    setError({ show: false, messages: [] });
    setLoading(true);
    try {
      const newPlan = await createPlan(createFormData);
      setPlans([...plans, newPlan]);
      setShowCreateForm(false);
      setCreateFormData({ name: '', description: '', price: 0 });
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
                    <div>
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      <p className="text-sm font-semibold text-primary">
                        ¥{plan.price.toLocaleString()}/月
                      </p>
                    </div>
                    {selectedPlanId?.includes(plan.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-2"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              新しいプランを作成
            </Button>
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
            </div>
            <div>
              <Label htmlFor="plan-description">説明 *</Label>
              <Textarea
                id="plan-description"
                value={createFormData.description}
                onChange={(e) => {
                  setCreateFormData({ ...createFormData, description: e.target.value });
                  if (error.show) {
                    setError({ show: false, messages: [] });
                  }
                }}
                placeholder="プランの説明を入力"
              />
            </div>
            <div>
              <Label htmlFor="plan-price">月額料金 (円) *</Label>
              <Input
                id="plan-price"
                type="number"
                value={createFormData.price === 0 ? '' : createFormData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setCreateFormData({ ...createFormData, price: 0 });
                    if (error.show) {
                      setError({ show: false, messages: [] });
                    }
                    return;
                  }

                  // 先頭の0を削除（ただし、値が0だけの場合は0を保持）
                  const cleanedValue = value.replace(/^0+(?=\d)/, '') || value;
                  const numValue = parseInt(cleanedValue, 10);

                  if (!isNaN(numValue)) {
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
            <div className="flex space-x-2">
              <Button onClick={handleCreatePlan} disabled={loading} className="flex-1">
                {loading ? '作成中...' : '作成'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({ name: '', description: '', price: 0 });
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
