import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// サムネイル表示 + 削除ボタン
export default function ThumbnailPreview({
  thumbnail,
  onRemove,
  onChange,
}: {
  thumbnail: string;
  onRemove: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-x-4 w-full">
      <div className="w-24 h-24 flex flex-col items-center justify-center border-2 rounded-md">
        <img
          src={thumbnail}
          alt="thumbnail"
          className="w-full h-full object-cover rounded-md cursor-pointer"
          onClick={() => document.getElementById('custom-thumbnail-upload')?.click()}
        />
        <Input
          id="custom-thumbnail-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </div>
      <Button className="text-xs self-start" variant="destructive" onClick={onRemove}>
        動画を削除
      </Button>
    </div>
  );
}
