import React from 'react';
import { Button } from '@/components/ui/button';
import { AccountEditHeaderSectionProps } from '@/features/account/AccountEdit/types';

export default function AccountEditHeaderSection({
  loading,
  onSave,
}: AccountEditHeaderSectionProps) {
  return (
    <div className="flex justify-end space-x-3">
      <Button variant="outline">キャンセル</Button>
      <Button className="bg-primary hover:bg-primary/90" onClick={onSave} disabled={loading}>
        {loading ? '保存中...' : '保存'}
      </Button>
    </div>
  );
}
