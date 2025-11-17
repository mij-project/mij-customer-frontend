import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountHeaderProps } from '@/features/account/types';

export default function AccountHeader({
  title,
  showBackButton = false,
  showActions = false,
  onBack = undefined,
}: AccountHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 w-full fixed top-0 left-0 right-0 bg-white z-10">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onBack ? onBack : () => navigate('/account')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      {showActions && (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
