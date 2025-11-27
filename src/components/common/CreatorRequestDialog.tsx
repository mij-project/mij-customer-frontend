import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface CreatorRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorRequestDialog({ isOpen, onClose }: CreatorRequestDialogProps) {
  const navigate = useNavigate();
  const handleCreatorRequest = () => {
    navigate('/creator/request');
  };
  const handleCancel = () => {
    onClose();
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            {/* <div className="flex items-center justify-end mb-6">
                            <Dialog.Close className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </Dialog.Close>
                        </div> */}

            {/* Logo */}
            <div className="text-center mb-8">
              <Dialog.Title asChild>
                <h4 className="text-md font-bold mb-2">この画面はクリエイター登録が必要です。</h4>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className="text-gray-600 text-sm">クリエイター登録へ進みますか？</p>
              </Dialog.Description>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreatorRequest}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-4 px-4 rounded-2xl text-base transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                はい
              </button>

              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold py-4 px-4 rounded-2xl text-base transition-all duration-200 hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]"
              >
                いいえ
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
