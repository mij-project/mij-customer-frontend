import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyPlanSectionProps {
  onCreatePlan: () => void;
}

export default function EmptyPlanSection({ onCreatePlan }: EmptyPlanSectionProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
        <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">プランを作成しましょう</h3>
        <p className="text-gray-600 mb-4">
          プランを作成して、ファンに定期的なコンテンツを提供しましょう
        </p>
        <Button onClick={onCreatePlan} className="bg-primary hover:bg-primary/90">
          プランを作成する
        </Button>
      </div>
    </div>
  );
}
