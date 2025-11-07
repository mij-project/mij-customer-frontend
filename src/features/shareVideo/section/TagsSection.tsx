import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TagsSectionProps } from '@/features/shareVideo/types';

export default function TagsSection({ tags, onChange }: TagsSectionProps) {
  return (
    <div className="bg-white border-b border-gray-200 space-y-2 pt-5 pb-5">
      <div className="space-y-4 p-5">
        <Label htmlFor="tags" className="text-sm font-medium font-bold">
          タグ
        </Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => onChange(e.target.value)}
          placeholder="タグを入力"
        />
      </div>
    </div>
  );
}
