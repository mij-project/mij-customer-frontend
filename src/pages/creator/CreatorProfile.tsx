import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

// 型定義は既存のAPI型を使用


export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'posts' | 'plans' | 'individual' | 'gacha'>('posts');
  const [creator, setCreator] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [individualPurchases, setIndividualPurchases] = useState<any[]>([]);
  const [gachaItems, setGachaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // TODO: 実際のAPIエンドポイントに置き換え
        // const creatorData = await getCreatorProfile(id);
        // const postsData = await getCreatorPosts(id);
        // const plansData = await getCreatorPlans(id);
        // const individualData = await getCreatorIndividualPurchases(id);
        // const gachaData = await getCreatorGachaItems(id);
        
        // setCreator(creatorData);
        // setPosts(postsData);
        // setPlans(plansData);
        // setIndividualPurchases(individualData);
        // setGachaItems(gachaData);
        
        // 一時的に空のデータを設定
        setCreator(null);
        setPosts([]);
        setPlans([]);
        setIndividualPurchases([]);
        setGachaItems([]);
        
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error('Creator profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [id]);

  const tabs = [
    { id: 'posts' as const, label: `投稿`, count: posts.length },
    { id: 'plans' as const, label: `プラン`, count: plans.length },
    { id: 'individual' as const, label: `単品購入`, count: individualPurchases.length },
    { id: 'gacha' as const, label: `ガチャ`, count: gachaItems.length }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'posts': 
        return <PostsSection posts={posts} />;
      case 'plans':
        return <PlansSection plans={plans} />;
      case 'individual':
        return <IndividualPurchaseSection items={individualPurchases} />;
      case 'gacha':
        return <GachaSection items={gachaItems} />;
      default:
        return <PostsSection posts={posts} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500">クリエイターが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white space-y-6 mb-20">
        <CreatorHeader creator={creator} />

        <section className="bg-white border-b border-gray-200 py-6">
          <PlanArea plans={plans} />
        </section>

        <section className="bg-white border-b border-gray-200 py-6">
          <GachaPlan items={gachaItems} />
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
