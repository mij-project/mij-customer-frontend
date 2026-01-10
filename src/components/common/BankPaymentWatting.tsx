import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


interface BankPaymentWattingProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function BankPaymentWatting({ isOpen, onClose }: BankPaymentWattingProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-[100] bg-black/30" />
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
        <DialogHeader>
          <DialogTitle>振込待ち</DialogTitle>
					{/* 左寄せ */}
					<DialogDescription className="pt-4 text-xs text-gray-700 whitespace-pre-line text-left">
						現在こちらのコンテンツは振込待ちの状態です。
						<br />
						購入時に入力したメールアドレスに振込先情報をお送りしております。
						<br />
						該当口座へ入金が確認できたら、時間帯や曜日を問わずおよそ1時間以内に購入が完了します。
						<br />
						購入完了次第コンテンツの視聴が可能になります。
					</DialogDescription>
        </DialogHeader>
				<DialogFooter>
					<Button onClick={onClose} className="w-full py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base">閉じる</Button>
				</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}