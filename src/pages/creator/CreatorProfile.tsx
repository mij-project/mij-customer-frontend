import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share, 
  MessageCircle, 
  Crown,
  Star,
  Link as LinkIcon
} from 'lucide-react';


// セクション
import PostsSection from '@/features/creater/section/PostsSection';
import PlansSection from '@/features/creater/section/PlansSection';
import IndividualPurchaseSection from '@/features/creater/section/IndividualPurchaseSection';
import GachaSection from '@/features/creater/section/GachaSection';
import CreatorHeader from '@/features/creater/section/CreatorHeader';
import PlanArea from '@/features/creater/section/PlanArea';
import GachaPlan from '@/features/creater/section/GachaPlan';
import TabsSection from '@/features/creater/section/TabsSection';
import BottomNavigation from '@/components/common/BottomNavigation';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  duration: string;
  date: string;
  isVideo?: boolean;
}

interface Plan {
  id: string;
  title: string;
  description: string;
  thumbnails: string[];
  postCount: number;
  monthlyPrice: number;
  isRecommended?: boolean;
  isFree?: boolean;
}

interface GachaItem {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  remaining: number;
  total: number;
}

interface IndividualPurchase {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  duration?: string;
  date: string;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  postCount: number;
  followerCount: number;
  websiteUrl?: string;
  isFollowing: boolean;
  backgroundImage: string;
}

const mockCreator: Creator = {
  id: '1',
  name: 'さとみめろん',
  username: '@satomimelon',
  avatar: 'https://picsum.photos/200/200?random=1',
  bio: 'さとみです。いつもSNSでの応援ありがとうございます🍈Hカップで応援！仕事の疲れを癒したいと思ってます。ムチムチだし、剛毛だし、デカ尻だし巨乳🍈しか取りえないのわかってます。だから、いつも笑顔で全力でおっぱいで癒したい🍈🍈🍈',
  postCount: 71,
  followerCount: 2007,
  websiteUrl: 'https://note.com/satomimelon',
  isFollowing: false,
  backgroundImage: 'https://picsum.photos/200/200?random=2'
};

const mockPosts: Post[] = [
  {
    id: '1',
    title: '最初で最後のへたっぴフェラです🍌💦',
    thumbnail: 'https://picsum.photos/300/200?random=11',
    price: 4980,
    duration: '05:36',
    date: '2025/07/30 09:00',
    isVideo: true
  },
  {
    id: '2',
    title: 'はじめましての方へ',
    thumbnail: 'https://picsum.photos/300/200?random=12',
    price: 980,
    duration: '20:58',
    date: '2025/06/11 09:30',
    isVideo: true
  },
  {
    id: '3',
    title: '潮吹き解禁しました💦',
    thumbnail: 'https://picsum.photos/300/200?random=13',
    price: 5980,
    duration: '10:46',
    date: '2025/05/28 09:00',
    isVideo: true
  },
  {
    id: '4',
    title: 'ノーパン出社してそのまま車で唾液オナニーしちゃいました',
    thumbnail: 'https://picsum.photos/300/200?random=14',
    price: 3980,
    duration: '13:05',
    date: '2025/07/31 06:27',
    isVideo: true
  },
  {
    id: '5',
    title: '仕事中におさぼり指オナニーしました',
    thumbnail: 'https://picsum.photos/300/200?random=15',
    price: 3980,
    duration: '09:42',
    date: '2025/08/02 01:00',
    isVideo: true
  },
  {
    id: '6',
    title: '先輩と車内でおさぼりえっちオナニー',
    thumbnail: 'https://picsum.photos/300/200?random=16',
    price: 2980,
    duration: '11:37',
    date: '2025/08/01 09:00',
    isVideo: true
  }
];

const mockPlans: Plan[] = [
  {
    id: '1',
    title: '【定額】高級🍈プラン(週1更新)',
    description: 'おすすめプラン',
    thumbnails: [
      'https://picsum.photos/150/100?random=21',
      'https://picsum.photos/150/100?random=22',
      'https://picsum.photos/150/100?random=23'
    ],
    postCount: 62,
    monthlyPrice: 11919,
    isRecommended: true
  },
  {
    id: '2',
    title: '🍐プラン(無料)',
    description: '無料プラン',
    thumbnails: ['https://picsum.photos/150/100?random=24'],
    postCount: 1,
    monthlyPrice: 0,
    isFree: true
  },
  {
    id: '3',
    title: '【定額】🍉プラン (週1更新)',
    description: 'スタンダードプラン',
    thumbnails: [
      'https://picsum.photos/150/100?random=25',
      'https://picsum.photos/150/100?random=26'
    ],
    postCount: 41,
    monthlyPrice: 6980
  }
];

const mockGachaItems: GachaItem[] = [
  {
    id: '1',
    title: '【ハズレなし】さとみの思い出の下着ガチャ(パンスト付き)',
    thumbnail: 'https://picsum.photos/200/150?random=31',
    price: 5980,
    remaining: 0,
    total: 10
  },
  {
    id: '2',
    title: '【ハズレなし】さとみの思い出の下着ガチャ',
    thumbnail: 'https://picsum.photos/200/150?random=32',
    price: 5980,
    remaining: 0,
    total: 38
  }
];

const mockIndividualPurchases: IndividualPurchase[] = [
  {
    id: '1',
    title: '限定写真集セット',
    thumbnail: 'https://picsum.photos/300/200?random=41',
    price: 2980,
    date: '2025/08/01'
  },
  {
    id: '2',
    title: 'プレミアム動画パック',
    thumbnail: 'https://picsum.photos/300/200?random=42',
    price: 4980,
    duration: '15:30',
    date: '2025/07/28'
  },
  {
    id: '3',
    title: '特別限定コンテンツ',
    thumbnail: 'https://picsum.photos/300/200?random=43',
    price: 1980,
    date: '2025/07/25'
  },
  {
    id: '4',
    title: 'プライベート動画集',
    thumbnail: 'https://picsum.photos/300/200?random=44',
    price: 3980,
    duration: '12:45',
    date: '2025/07/20'
  }
];


export default function CreatorProfile() {
  const [activeTab, setActiveTab] = useState<'posts' | 'plans' | 'individual' | 'gacha'>('posts');

  const tabs = [
    { id: 'posts' as const, label: `投稿`, count: mockPosts.length },
    { id: 'plans' as const, label: `プラン`, count: mockPlans.length },
    { id: 'individual' as const, label: `単品購入`, count: mockIndividualPurchases.length },
    { id: 'gacha' as const, label: `ガチャ`, count: mockGachaItems.length }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'posts': 
        return <PostsSection posts={mockPosts} />;
      case 'plans':
        return <PlansSection plans={mockPlans} />;
      case 'individual':
        return <IndividualPurchaseSection items={mockIndividualPurchases} />;
      case 'gacha':
        return <GachaSection items={mockGachaItems} />;
      default:
        return <PostsSection posts={mockPosts} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white space-y-6 mb-20">
        <CreatorHeader creator={mockCreator} />

        <section className="bg-white border-b border-gray-200 py-6">
          <PlanArea plans={mockPlans} />
        </section>

        <section className="bg-white border-b border-gray-200 py-6">
          <GachaPlan items={mockGachaItems} />
        </section>

        <section className="bg-white border-b border-gray-200">
          <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        </section>

        <section className="py-8">
          {renderContent()}
        </section>

        <BottomNavigation />
      </div>
    </div>
  );
}
