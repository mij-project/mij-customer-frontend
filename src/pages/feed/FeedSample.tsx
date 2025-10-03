import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  ShoppingCart,
  Bookmark,
  Heart,
  History,
  ChevronRight,
  Play,
  Clock,
  Eye,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import VerticalVideoCard from '@/components/video/VerticalVideoCard';
import { PostDetailData } from '@/api/types/post';

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { cn } from "@/lib/utils";

const mockFeedPosts: PostDetailData[] = [
  {
    id: '1',
    title: '【限定公開】プライベート動画集 Vol.1 - 夏の思い出を特別にお届け♡',
    thumbnail: 'https://picsum.photos/400/600?random=101',
    description: '夏の思い出を特別にお届けする限定動画です',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    main_video_duration: '12:34',
    sample_video_duration: '0:30',
    views: 15420,
    likes: 892,
    purchased: false,
    video_url: 'https://picsum.photos/400/600?random=101',
    creator: {
      name: 'あやか',
      profile_name: 'ayaka',
      avatar: 'https://picsum.photos/100/100?random=201',
      verified: true
    },
    categories: [],
    media_assets: {},
    subscription: {
      id: '1',
      amount: 1000,
      currency: 'JPY',
      interval: 'month',
      plan_name: 'ベーシックプラン',
      plan_description: 'ベーシックプランの説明'
    },
    single: {
      id: '1',
      amount: 500,
      currency: 'JPY'
    }
  },
  {
    id: '2',
    title: '夏の思い出 ビーチフォト撮影 - 海辺での特別な一日をシェア',
    thumbnail: 'https://picsum.photos/400/600?random=102',
    description: '海辺での特別な一日をシェア',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    main_video_duration: '8:45',
    sample_video_duration: '0:30',
    views: 23100,
    likes: 1340,
    purchased: false,
    video_url: 'https://picsum.photos/400/600?random=102',
    creator: {
      name: 'みお',
      profile_name: 'mio',
      avatar: 'https://picsum.photos/100/100?random=202',
      verified: false
    },
    categories: [],
    media_assets: {},
    subscription: {
      id: '2',
      amount: 800,
      currency: 'JPY',
      interval: 'month',
      plan_name: 'スタンダードプラン',
      plan_description: 'スタンダードプランの説明'
    },
    single: {
      id: '2',
      amount: 300,
      currency: 'JPY'
    }
  }
];

const bannerItems = [
  { id: '1', image: 'https://picsum.photos/800/200?random=31', title: '夏の特別企画' },
  { id: '2', image: 'https://picsum.photos/800/200?random=32', title: '新人クリエイター特集' },
  { id: '3', image: 'https://picsum.photos/800/200?random=33', title: '人気動画ランキング' }
];

export default function FeedSample() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    vertical: true,
    slides: {
      perView: 1,
      spacing: 0,
    },
    slideChanged(slider) {
      setCurrentVideoIndex(slider.track.details.rel);
    },
    renderMode: "performance",
  });

  const handleVideoClick = (index: number) => {
    if (instanceRef.current) {
      instanceRef.current.moveToIdx(index);
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden">

      <div ref={sliderRef} className="keen-slider h-full">
        {mockFeedPosts.map((post, index) => (
          <div key={post.id} className="keen-slider__slide">
            <VerticalVideoCard
              post={post}
              isActive={index === currentVideoIndex}
              onVideoClick={() => handleVideoClick(index)}
              onPurchaseClick={() => {}}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50">
        <BottomNavigation />
      </div>
    </div>
  );
}
