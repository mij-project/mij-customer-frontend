import React from 'react';
import { Share, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderSectionProps {
  coverUrl?: string;
  avatarUrl?: string;
  username: string;
}

export default function ProfileHeaderSection({ coverUrl, avatarUrl, username }: ProfileHeaderSectionProps) {
  return (
    <div className="relative">
      <div 
        className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"
        style={{
          backgroundImage: coverUrl ? `${coverUrl}` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="absolute -bottom-10 left-6">
        <img 
          src={avatarUrl || '/assets/no-image.svg'} 
          alt={username}
          className="w-20 h-20 rounded-full border-4 border-white object-cover"
        />
      </div>
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button variant="ghost" size="sm" className="bg-white/20 text-white hover:bg-white/30">
          <Share className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="bg-white/20 text-white hover:bg-white/30">
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 