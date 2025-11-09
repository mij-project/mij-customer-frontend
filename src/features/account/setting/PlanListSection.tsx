import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Plan {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  subscriberCount: number;
  createdDate: string;
}

interface PlanListSectionProps {
  plans: Plan[];
  onTogglePlan: (planId: string) => void;
  onEditPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
}

export default function PlanListSection({
  plans,
  onTogglePlan,
  onEditPlan,
  onDeletePlan,
}: PlanListSectionProps) {
  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.isActive ? '公開中' : '非公開'}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{plan.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>月額 ¥{plan.price.toLocaleString()}</span>
                <span>{plan.subscriberCount}人が加入中</span>
                <span>作成日: {plan.createdDate}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onTogglePlan(plan.id)}>
                {plan.isActive ? '非公開にする' : '公開する'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEditPlan(plan.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeletePlan(plan.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
