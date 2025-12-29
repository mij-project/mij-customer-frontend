import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';
interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextPaymentDate: string;
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  nextPaymentDate,
}: CancelSubscriptionModalProps) {
  const formattedDate = new Date(nextPaymentDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-[100] bg-black/30" />
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 text-primary mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
            <DialogTitle>プランの解約</DialogTitle>
          </div>
          <DialogDescription className="text-center">
            プランの解約が完了しました。
            <br />
            次回から決済の引き落としが停止されます。
            <br />
            {formattedDate}までプランの視聴が可能になります。
            <br />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
