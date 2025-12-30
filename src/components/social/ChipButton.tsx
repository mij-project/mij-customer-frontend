import { useState } from 'react';
import { BadgeCent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthContext';

interface ChipButtonProps {
  onClick: () => void;
  onAuthRequired?: () => void;
}

export default function ChipButton({ onClick, onAuthRequired }: ChipButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (loading) return;
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }
    onClick();
  };
  return (
    <Button
      onClick={handleClick}
      className="bg-primary hover:bg-primary/90 text-white rounded-full py-2.5 px-5 h-9 font-medium"
    >
      <BadgeCent className="h-4 w-4" />
      <span className="text-xs font-medium">チップを贈る</span>
    </Button>
  );
}
