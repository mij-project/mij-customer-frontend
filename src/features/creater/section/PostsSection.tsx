import { Play, Clock } from 'lucide-react';
import { Post } from '@/features/creater/types';

export default function PostsSection({ posts }: { posts: Post[] }) {
  // 投稿が3つ並びで表示する
  // スマホレイアウトで表示
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="relative">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full aspect-square object-cover"
            />
            {post.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-80" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {post.duration}
            </div>
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              ¥{post.price.toLocaleString()}
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-500 mb-1">{post.date}</p>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{post.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
