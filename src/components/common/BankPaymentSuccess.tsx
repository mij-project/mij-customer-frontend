import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


interface BankPaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function BankPaymentSuccess({ isOpen, onClose }: BankPaymentSuccessProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-[100] bg-black/30" />
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
        <DialogHeader>
          <DialogTitle>振込待ち</DialogTitle>
					{/* 左寄せ */}
					<DialogDescription className="pt-4 text-xs text-gray-700 whitespace-pre-line text-left">
						振込先はメールアドレスにお送りしております。
						<br />
						1週間以内でのお振込をお願いいたします。
						<br />
						該当口座へ入金が確認できたら、時間帯や曜日を問わずおよそ1時間以内に購入が完了します。
						<br />
						なお、振込元金融機関の処理によっては、
						<br />
						該当口座への入金が金融機関の翌営業日以降となる可能性があります。
						<br />
						入金予定時間は、振込元の金融機関にお問い合わせください。
					</DialogDescription>
        </DialogHeader>
				<DialogFooter>
					<Button onClick={onClose} className="w-full py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base">閉じる</Button>
				</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}