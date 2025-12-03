import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConvertFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConvertFailedModal: React.FC<ConvertFailedModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate('/account/post');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] [&>button]:hidden z-[100] rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 text-red-600">
            <AlertTriangle className="w-10 h-10 text-red-600" />
            動画変換に失敗しました
          </DialogTitle>
          <DialogDescription className="text-gray-700 leading-relaxed pt-2">
            動画変換中の不具合により正常に動画を生成することが出来ませんでした。大変申し訳ございませんが再度投稿の申請をしてください。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleClose}
            className="w-full bg-primary hover:bg-primary/90"
          >
            投稿一覧に戻る
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertFailedModal;
