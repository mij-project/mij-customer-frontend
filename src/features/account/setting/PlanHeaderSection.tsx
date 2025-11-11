import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PlanHeaderSectionProps {
  onCreatePlan: () => void;
}

export default function PlanHeaderSection({ onCreatePlan }: PlanHeaderSectionProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">プラン一覧</h2>
      <Button onClick={onCreatePlan} className="bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        新しいプランを作成
      </Button>
    </div>
  );
}
