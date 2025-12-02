import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react'; // ← 写真アイコン
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
        {/* OGP画像 - 1200x630の比率で表示 */}
        <div className="w-full aspect-[1200/630] bg-black flex items-center justify-center">
          <img
            src={ogp}
            alt="ogp"
            className="w-full h-full object-cover cursor-pointer"
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
