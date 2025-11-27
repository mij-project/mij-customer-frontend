import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = '投稿がありません' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-4 text-primary">
        <Inbox className="w-full h-full stroke-[1.5]" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}
