import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { ShoppingCart, Bookmark, Heart, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';

export default function PostLibraryNavigationSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleClick = (path: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    navigate(path);
  };

  return (
    <section className="max-w-screen-md mx-auto bg-white border-b border-gray-200">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-around w-full py-4">
          <div className="flex flex-col items-center space-y-1 text-gray-700 cursor-pointer">
            <ShoppingCart className="h-5 w-5" onClick={() => handleClick('/bought/post')} />
            <span className="font-medium text-xs">購入済み</span>
          </div>
          <div className="flex flex-col items-center space-y-1 text-gray-700 cursor-pointer">
            <Bookmark className="h-5 w-5" onClick={() => handleClick('/bookmark/post')} />
            <span className="font-medium text-xs">保存済み</span>
          </div>
          <div className="flex flex-col items-center space-y-1 text-gray-700 cursor-pointer">
            <Heart className="h-5 w-5" onClick={() => handleClick('/like/post')} />
            <span className="font-medium text-xs">いいね済み</span>
          </div>
          {/* <div className="flex flex-col items-center space-y-1 text-gray-700 hover:text-primary cursor-pointer">
            <History className="h-5 w-5" />
            <span className="font-medium text-xs">閲覧履歴</span>
          </div> */}
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </section>
  );
}
