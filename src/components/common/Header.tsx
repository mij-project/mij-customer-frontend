import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';

export default function Header() {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleBellClick = () => {
    if (user) {
      navigate('/account/notifications');
    } else {
      setShowAuthDialog(true);
    }
  };
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0  right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div
              className="text-2xl font-bold text-primary cursor-pointer"
              onClick={() => navigate('/')}
            >
              mijfans
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBellClick}>
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
    </header>
  );
}
