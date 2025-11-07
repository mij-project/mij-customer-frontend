import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ConfirmationSectionProps } from '@/features/shareVideo/types';

export default function ConfirmationSection({
  checks,
  onCheckChange,
  onSelectAll,
}: ConfirmationSectionProps) {
  // 全てのチェックボックスが選択されているかチェック
  const allChecked = checks.confirm1 && checks.confirm2 && checks.confirm3;

  // 全てに同意するチェックボックスのハンドラー
  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    } else {
      // フォールバック: 個別に更新
      onCheckChange('confirm1', checked);
      onCheckChange('confirm2', checked);
      onCheckChange('confirm3', checked);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 space-y-2 pt-5 pb-5">
      <div className="space-y-4 m-4 p-4 bg-secondary rounded-md">
        {/* 全てに同意するチェックボックス */}
        <div className="border-b border-gray-300 pb-3 mb-3">
          <CheckRow
            id="selectAll"
            checked={allChecked}
            onChange={handleSelectAll}
            label="下記全てに同意する"
            isBold={true}
          />
        </div>

        <CheckRow
          id="confirm1"
          checked={checks.confirm1}
          onChange={(v) => {
            onCheckChange('confirm1', v);
            // 個別チェックボックスが変更された際の処理は親コンポーネントで管理
          }}
          label="投稿内容が著作権や肖像権の侵害にあたらないことを確認しました"
        />
        <CheckRow
          id="confirm2"
          checked={checks.confirm2}
          onChange={(v) => {
            onCheckChange('confirm2', v);
            // 個別チェックボックスが変更された際の処理は親コンポーネントで管理
          }}
          label="投稿内容に未成年者が写っていないこと、また未成年者を連想させる表現等が含まれていないことを確認しました"
        />
        <CheckRow
          id="confirm3"
          checked={checks.confirm3}
          onChange={(v) => {
            onCheckChange('confirm3', v);
            // 個別チェックボックスが変更された際の処理は親コンポーネントで管理
          }}
          label="性表現には十分に配慮してモザイク処理を行っていることを確認しました"
        />
        <a href="#" className="text-sm text-primary underline">
          モザイクのガイドラインを見る
        </a>
      </div>
    </div>
  );
}

// CheckRow 補助コンポーネント
function CheckRow({
  id,
  checked,
  onChange,
  label,
  isBold = false,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  isBold?: boolean;
}) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="mt-1" />
      <Label htmlFor={id} className={`text-sm leading-relaxed ${isBold ? 'font-semibold' : ''}`}>
        {label}
      </Label>
    </div>
  );
}
