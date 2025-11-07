import { Button } from '@/components/ui/button';
import { Share, MessageCircle, LinkIcon } from 'lucide-react';
import { Creator } from '@/features/creater/types';

export default function CreatorHeader({ creator }: { creator: Creator }) {
  return (
    <div className="relative border-b border-gray-200">
      {/* 背景画像エリア */}
      <div
        className="h-40 w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${creator.backgroundImage})`,
        }}
      />

      {/* コンテンツエリア（プロフィール） */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* アバターを少し重ねて表示 */}
          <div className="relative z-10">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{creator.name}</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white">フォロー</Button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-2">{creator.username}</p>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{creator.bio}</p>

            <div className="flex items-center space-x-6 text-sm">
              <span className="font-medium">
                <span className="text-gray-900">{creator.postCount}</span>
                <span className="text-gray-500 ml-1">投稿</span>
              </span>
              <span className="font-medium">
                <span className="text-gray-900">{creator.followerCount.toLocaleString()}</span>
                <span className="text-gray-500 ml-1">フォロワー</span>
              </span>
            </div>

            {creator.websiteUrl && (
              <div className="mt-2">
                <a
                  href={creator.websiteUrl}
                  className="text-primary hover:text-primary/80 text-sm flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  {creator.websiteUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
