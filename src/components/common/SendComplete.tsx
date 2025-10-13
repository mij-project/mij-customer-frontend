import React from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SendCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  for_address: string;
  send_type: 'email' | 'phone' | 'code';
}

export default function SendComplete( { isOpen, onClose, for_address, send_type }: SendCompleteProps ) {
  const getMainMessage = () => {
    if (send_type === 'email') {
      return `${for_address} に\n認証リンクを送信しました。`;
    } else if (send_type === 'phone') {
      return `${for_address} に\n認証コードを送信しました。\n受信したコードを入力してください。`;
    } else {
      return `入力されたコードが認証されました。`;
    }
  };

	const getSubMessage = () => {
		if (send_type === 'email' || send_type === 'phone') {
			return `送信が完了しました`;
		} else {
			return `認証が完了しました`;
		}
	};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-md rounded-2xl border-0 bg-white p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300">
        <DialogTitle className="sr-only">送信完了</DialogTitle>
        <DialogDescription className="sr-only">
          {getSubMessage()}
        </DialogDescription>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          {/* <h3 className="text-xl font-semibold text-gray-900">{getSubMessage()}</h3> */}
          <p className="text-xs text-gray-600 text-center whitespace-pre-line">
            {getMainMessage()}
          </p>
          <Button 
            onClick={onClose}
            className="w-full mt-4"
          >
            確認
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}