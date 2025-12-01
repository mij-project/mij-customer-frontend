
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BellRing } from 'lucide-react';
interface PrePostMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrePostMessageModal({ isOpen, onClose }: PrePostMessageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg text-center">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-center mb-5"> <BellRing className="w-10 h-10 text-primary" /> </div>
            事前投稿のお知らせ
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm">
        現在は事前投稿期間のため、<br />投稿はすべて「予約投稿」での受付となります。
        <br />
        予約投稿設定はリリース日の <br />【12月15日 12:00以降】に設定してください。
        <br />
        さらに、事前登録者様は3ヶ月間<br />「手数料0％」が適用されます！
        <br />
        収益がそのまま入るため、キャンペーンの<br />「＋10,000円付与」もより狙いやすくなります。
        <br />
        <br />
        リリースに向けて、<br />今のうちに作品を準備しておきましょう。
        <br />
        最高のスタートダッシュを！
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}