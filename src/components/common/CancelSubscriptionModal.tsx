import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import convertDatetimeToLocalTimezone from "@/utils/convertDatetimeToLocalTimezone";
interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
	nextPaymentDate: string;
}

export default function CancelSubscriptionModal({ isOpen, onClose, nextPaymentDate }: CancelSubscriptionModalProps) {
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-[100] bg-black/30" />
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 text-primary">
            <CheckCircle className="w-10 h-10 text-primary" />
            <DialogTitle>プランの解約</DialogTitle>
						<DialogDescription>
							プランの解約が完了しました。<br />
							次回から決済の引き落としが停止されます。<br />
							{nextPaymentDate}までプランの視聴が可能になります。<br />
						</DialogDescription>
					</DialogTitle>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}