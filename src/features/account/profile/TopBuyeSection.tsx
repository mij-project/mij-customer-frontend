import { TopBuyer } from '@/api/types/profile';
import { FaFire } from 'react-icons/fa';
import noImageSvg from '@/assets/no-image.svg';
import { Crown } from 'lucide-react';

interface TopBuyerSectionProps {
  topBuyers: TopBuyer[];
  profile_name: string;
}

export default function TopBuyerSection({ topBuyers, profile_name }: TopBuyerSectionProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1)
      return {
        text: 'text-[#f9e16b] drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]',
        fill: 'fill-[#f9e16b]',
      };
    if (rank === 2)
      return {
        text: 'text-[#d4d8e3] drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]',
        fill: 'fill-[#d4d8e3]',
      };
    if (rank === 3)
      return {
        text: 'text-[#d49a6a] drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]',
        fill: 'fill-[#d49a6a]',
      };
    return { text: 'text-primary', fill: 'fill-primary' };
  };

  if (!topBuyers || topBuyers.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-b border-gray-200 py-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <FaFire className="h-6 w-6 text-red-500 animate-pulse" />
          <div className="absolute inset-0 blur-sm">
            <FaFire className="h-6 w-6 text-red-400" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          {`${profile_name}の推しランキング`}
        </h3>
      </div>
      <div className="space-y-3">
        {topBuyers.map((buyer, index) => {
          const rank = index + 1;
          const rankColor = getRankColor(rank);

          // ランク別の背景スタイル
          const getBgStyle = (rank: number) => {
            if (rank === 1)
              return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg';
            if (rank === 2)
              return 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 shadow-md';
            if (rank === 3)
              return 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 shadow-md';
            return 'bg-white border border-gray-200 hover:border-primary/30 hover:shadow-sm';
          };

          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${getBgStyle(rank)}`}
            >
              {/* ランクバッジ */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0 w-12">
                {rank <= 3 ? (
                  <>
                    <div className="relative flex items-center justify-center">
                      <Crown className={`h-8 w-8 ${rankColor.text} ${rankColor.fill}`} />
                      <span className="absolute text-[13px] font-bold text-white leading-none drop-shadow-md">
                        {rank}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold ${rankColor.text}`}>
                      {rank === 1 ? 'GOLD' : rank === 2 ? 'SILVER' : 'BRONZE'}
                    </span>
                  </>
                ) : rank <= 6 ? (
                  <div className="relative flex items-center justify-center">
                    <Crown className={`h-7 w-7 ${rankColor.text} ${rankColor.fill}`} />
                    <span className="absolute text-[12px] font-bold text-white leading-none">
                      {rank}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300">
                    <span className="text-sm font-bold text-gray-600">{rank}</span>
                  </div>
                )}
              </div>

              {/* ユーザー情報 */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`relative ${rank <= 3 ? 'w-12 h-12' : 'w-10 h-10'} rounded-full flex-shrink-0 overflow-hidden ${rank === 1 ? 'ring-4 ring-yellow-300 ring-offset-2' : rank === 2 ? 'ring-4 ring-gray-300 ring-offset-2' : rank === 3 ? 'ring-4 ring-orange-300 ring-offset-2' : 'ring-2 ring-gray-200'}`}
                >
                  <img
                    src={buyer.avatar_url || noImageSvg}
                    alt={buyer.profile_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={`${rank <= 3 ? 'text-base font-bold' : 'text-sm font-semibold'} text-gray-900 truncate`}
                  >
                    {buyer.profile_name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {buyer.username.startsWith('@') ? buyer.username : `@${buyer.username}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
