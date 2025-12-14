import React from 'react';
import { Share, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderSectionProps {
  coverUrl?: string;
  avatarUrl?: string;
  username: string;
}

export default function ProfileHeaderSection({
  coverUrl,
  avatarUrl,
  username,
}: ProfileHeaderSectionProps) {
  const navigate = useNavigate();
  const handleShare = () => {
    // シェア機能の実装
    if (navigator.share) {
      navigator
        .share({
          title: `${username}のプロフィール`,
          url: window.location.href,
        })
        .catch((error) => console.log('Share error:', error));
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    }
  };

  const handleBookmark = () => {
    // ブックマーク機能の実装（保存機能）
    // TODO: 実際のブックマークAPIを実装
    alert('ブックマークに保存しました');
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-0 w-full bg-transparent">
        <Button variant="ghost" size="sm" className="bg-transparent text-gray-700 hover:bg-transparent rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="w-full aspect-[2/1] bg-gradient-to-r from-primary to-secondary"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      <div className="absolute -bottom-12 left-4">
        <img
          src={avatarUrl || '/assets/no-image.svg'}
          alt={username}
          className="w-24 h-24 rounded-full border-4 border-white object-cover"
        />
      </div>
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/80 text-gray-700 hover:bg-white rounded-full"
          onClick={handleShare}
        >
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
