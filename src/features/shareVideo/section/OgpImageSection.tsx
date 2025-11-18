import React from 'react';
import { Label } from '@/components/ui/label';
import OgpPreview from '@/features/shareVideo/componets/OgpPreview';
import OgpUploadArea from '@/features/shareVideo/componets/OgpUploadArea,';
import { OgpImageSectionProps } from '@/features/shareVideo/types';

export default function OgpImageSection({
  ogp,
  onFileChange,
  onRemove
}: OgpImageSectionProps & { onRemove?: () => void }) {
  return (
    <div className="space-y-2 pr-5 pl-5 bg-white border-t border-b border-primary pt-5 pb-5">
      <Label htmlFor="ogp-image" className="text-sm font-medium font-bold">
        OGP画像を設定する
      </Label>

      {ogp ? (
        <OgpPreview ogp={ogp} onChange={onFileChange} onRemove={onRemove} />
      ) : (
        <OgpUploadArea onFileChange={onFileChange} />
      )}

      <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 mt-2">
        <li>
          OGP画像とはSNSなどでリンクを貼った際に表示される画像です。推奨サイズは1200✕630ピクセルです。
        </li>
        <li>
          設定すると審査対象となり、利用規約違反があった場合は、予告なくアカウントが凍結される可能性があります。
        </li>
      </ul>
    </div>
  );
}
