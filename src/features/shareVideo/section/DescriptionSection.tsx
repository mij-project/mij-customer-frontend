import React, { useRef, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DescriptionSectionProps } from '@/features/shareVideo/types';
import { NG_WORDS } from '@/constants/ng_word';
import ErrorMessage from '@/components/common/ErrorMessage';

const MAX_DESCRIPTION_LENGTH = 1500;

export default function DescriptionSection({ description, onChange }: DescriptionSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // NGワードチェック
  const detectedNgWords = useMemo(() => {
    if (!description) return [];
    const found: string[] = [];
    NG_WORDS.forEach((word) => {
      if (description.includes(word)) {
        found.push(word);
      }
    });
    return found;
  }, [description]);

  // 入力に合わせてテキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      // 高さをリセット
      textareaRef.current.style.height = 'auto';
      // スクロール高さに合わせて調整
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [description]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // 最大文字数を超えないようにする
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      onChange(value);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 space-y-2 pr-5 pl-5 pt-5 pb-5">
      <div className="flex items-center justify-between">
        <Label htmlFor="description" className="text-sm font-medium font-bold">
          <span className="text-primary mr-1">*</span>説明文
        </Label>
        <span className="text-xs text-gray-500">
          {description.length} / {MAX_DESCRIPTION_LENGTH}
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        id="description"
        value={description}
        onChange={handleChange}
        placeholder="説明文を入力"
        rows={3}
        className="resize-none border border-gray-300 focus:outline-none focus:ring-0 focus:border-primary focus:border-2 shadow-none overflow-hidden min-h-[80px]"
      />
      {detectedNgWords.length > 0 && (
        <ErrorMessage
          message={[
            `NGワードが検出されました: ${detectedNgWords.join('、')}`,
            `検出されたNGワード数: ${detectedNgWords.length}個`,
          ]}
          variant="error"
        />
      )}
    </div>
  );
}
