import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';

interface TimeSaleExpiredProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimeSaleExpired({ isOpen, onClose }: TimeSaleExpiredProps) {

  const navigate = useNavigate();

	// モーダルを閉じて画面を再リロード
	const handleClose = () => {
		onClose();
		window.location.reload();
	}
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-[100] bg-black/30" />
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2">
            タイムセールが終了しました
          </DialogTitle>
          <DialogDescription className="pt-4">
            申し訳ございませんが、画面を再読み込みしてください。
						<br />
						再度購入手続きを進めてください。
						<br />
						ご不便をおかけして申し訳ございません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <Button onClick={handleClose} variant="outline" className="w-full">
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
