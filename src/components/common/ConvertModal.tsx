import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from "@/components/ui/dialog";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertModal({ isOpen, onClose }: ConvertModalProps) {
	const navigate = useNavigate();
  return (
		<Dialog open={isOpen} onOpenChange={onClose}>
		<DialogOverlay className="z-[100] bg-black/30" />
		<DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
			<DialogHeader>
			<DialogTitle className="flex flex-col items-center gap-2">
				送信処理中
				<Loader2 className="w-10 h-10 animate-spin text-primary" />
			</DialogTitle>
				<DialogDescription className="pt-4">
					動画の送信処理が行われています。
					<br />
					しばらくお待ちください。
					<br />
					<br />
					送信が完了するまで、この投稿の操作はできません。
				</DialogDescription>
			</DialogHeader>
			<DialogFooter className="flex justify-center">
				<Button
					onClick={() => navigate('/account/post')}
					variant="outline"
					className="w-full"
				>
					投稿一覧に戻る
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
  );
}