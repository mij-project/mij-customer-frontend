import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlanManagementSection() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <Button
        variant="ghost"
        className="w-full justify-start text-left"
        onClick={() => navigate('/account/plan-setting')}
      >
        <Calendar className="h-5 w-5 mr-3" />
        プラン管理
      </Button>
    </div>
  );
}
