import { UploadCloud } from "lucide-react";

// 動画アップロードエリア
export default function MainStreemUploadArea({ onFileChange }: { onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
      <div className="bg-white border-none bg-white">
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-primary text-primary rounded-md hover:bg-primary/5 transition-colors">
            <UploadCloud className="w-8 h-8" />
            <span className="text-xs mt-2">動画</span>
          </div>
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    );
  }
  