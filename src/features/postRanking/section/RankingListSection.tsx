import React from 'react';
import { ChevronRight, Crown, Clock, Play, Eye, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RankingSection } from '../types';

interface RankingListSectionProps {
  sections: RankingSection[];
  posts: any[];
}

export default function RankingListSection({ sections, posts }: RankingListSectionProps) {
  const navigate = useNavigate();

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="bg-white py-6 border-t border-gray-200">
          <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Crown className="h-5 w-5 text-primary mr-2" />
                {section.title}
              </h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                もっと見る
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={post.thumbnail_url}
                      alt={post.description}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                      {post.rank === 1 && <Crown className="h-3 w-3 mr-1" />}#{post.rank}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                      {post.description}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={post.creator_avatar_url}
                        alt={post.creator_name}
                        className="w-6 h-6 rounded-full"
                        onClick={() => {
                          handleCreatorClick(post.username);
                        }}
                      />
                      <span
                        onClick={() => {
                          handleCreatorClick(post.username);
                        }}
                        className="text-xs text-gray-600 flex items-center cursor-pointer"
                      >
                        {post.creator_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.likes_count.toLocaleString()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
