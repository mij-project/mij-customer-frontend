import { Input } from '@/components/ui/input';
import { ImageIcon, Trash2 } from 'lucide-react'; // ← 写真アイコンとゴミ箱アイコン
import { cn } from '@/lib/utils'; // shadcnを使っていれば便利なclass結合

export default function OgpPreview({
  ogp,
  onChange,
  onRemove,
}: {
  ogp: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-x-4 w-full">
      <div className="w-full relative border-2 rounded-md overflow-hidden">
        {/* OGP画像 - 固定高さのコンテナ */}
        <div className="w-full h-[200px] bg-black flex items-center justify-center">
          <img
            src={ogp}
            alt="ogp"
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={() => document.getElementById('custom-ogp-upload')?.click()}
          />
        </div>

        {/* 右上の写真アイコンボタン */}
        <button
          type="button"
          onClick={() => document.getElementById('custom-ogp-upload')?.click()}
          className={cn(
            'absolute top-2 right-2 bg-white text-gray-600 hover:text-primary',
            'rounded-full p-2 shadow-md transition'
          )}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* 削除ボタン（onRemoveが提供されている場合のみ表示） */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'absolute top-2 right-14 bg-white text-red-600 hover:text-red-700',
              'rounded-full p-2 shadow-md transition'
            )}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        {/* 非表示のファイル入力 */}
        <Input
          id="custom-ogp-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </div>
    </div>
  );
}
