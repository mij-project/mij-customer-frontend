import { UploadCloud } from 'lucide-react';

// 動画アップロードエリア
export default function SampleStreemUploadArea({
  onFileChange,
}: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <label htmlFor="sample-video-upload" className="cursor-pointer">
        <div className="w-24 h-24 flex flex-col items-center justify-center text-primary rounded-md">
          <UploadCloud className="w-8 h-8" />
          <span className="text-xs mt-2">動画</span>
        </div>
      </label>
      <input
        id="sample-video-upload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onFileChange}
      />
    </>
  );
}
