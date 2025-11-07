import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { X, LogIn, UserPlus } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-end mb-6">
              <Dialog.Close className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </Dialog.Close>
            </div>

            {/* Logo */}
            <div className="text-center mb-8">
              <h4 className="text-md font-bold mb-2">ご利用にはログインが必要です</h4>
              <p className="text-gray-600 text-sm">
                ユーザー登録がまだの場合は新規登録を行ってください。
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-4 px-4 rounded-2xl text-base transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <LogIn className="h-4 w-4" />
                ログイン
              </button>

              <button
                onClick={handleSignup}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold py-4 px-4 rounded-2xl text-base transition-all duration-200 hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" />
                新規登録
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
