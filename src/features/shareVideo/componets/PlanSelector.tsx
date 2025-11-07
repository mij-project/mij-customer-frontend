import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check } from 'lucide-react';
import { getPlans, createPlan } from '@/api/endpoints/plans';
import { Plan, PlanCreateRequest } from '@/api/types/plan';

interface PlanSelectorProps {
  selectedPlanId?: string[];
  onPlanSelect: (planId: string, planName?: string) => void;
  onClose: () => void;
}

export default function PlanSelector({ selectedPlanId, onPlanSelect, onClose }: PlanSelectorProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState<PlanCreateRequest>({
    name: '',
    description: '',
    price: 1000,
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
    if (!createFormData.name.trim() || createFormData.price <= 0) {
      alert('プラン名と価格を正しく入力してください');
      return;
    }

    setLoading(true);
    try {
      const newPlan = await createPlan(createFormData);
      setPlans([...plans, newPlan]);
      setShowCreateForm(false);
      setCreateFormData({ name: '', description: '', price: 1000 });
      onPlanSelect(newPlan.id, newPlan.name);
    } catch (error) {
      console.error('プラン作成エラー:', error);
      alert('プランの作成に失敗しました');
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
            <div>
              <Label htmlFor="plan-name">プラン名 *</Label>
              <Input
                id="plan-name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="プラン名を入力"
              />
            </div>
            <div>
              <Label htmlFor="plan-description">説明</Label>
              <Textarea
                id="plan-description"
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, description: e.target.value })
                }
                placeholder="プランの説明を入力"
              />
            </div>
            <div>
              <Label htmlFor="plan-price">月額料金 (円) *</Label>
              <Input
                id="plan-price"
                type="number"
                value={createFormData.price}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, price: parseInt(e.target.value) || 0 })
                }
                min="1"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreatePlan} disabled={loading} className="flex-1">
                {loading ? '作成中...' : '作成'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
