import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProfileFormSectionProps } from '@/features/account/AccountEdit/types';
import { ProfileData } from '@/features/account/AccountEdit/types';

export default function ProfileFormSection({
  profileData,
  onInputChange,
}: ProfileFormSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          名前
        </Label>
        <Input
          type="text"
          id="name"
          value={profileData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="名前を入力してください"
        />
      </div>

      <div>
        <Label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
          ID
        </Label>
        <Input
          type="text"
          id="id"
          value={profileData.id}
          onChange={(e) => onInputChange('id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          説明文
        </Label>
        <Textarea
          id="description"
          value={profileData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="プロフィールについて入力してください"
        />
      </div>

      <div>
        <Label htmlFor="links" className="block text-sm font-medium text-gray-700 mb-2">
          リンク
        </Label>
        <Input
          type="url"
          id="links"
          value={profileData.links.website || ''}
          onChange={(e) => onInputChange('links', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  );
}
