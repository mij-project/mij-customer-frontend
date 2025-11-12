import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import CreatorsSection from '@/features/top/section/CreatorsSection';
import { getCreatorList } from '@/api/endpoints/creator';
import { Creator } from '@/features/top/types';

const CreatorList = () => {
  const navigate = useNavigate();
  const [creatorList, setCreatorList] = useState<any[]>([]);

  const convertToCreators = (creators): Creator[] => {
    return creators.map((creator) => ({
      id: creator.id,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar_url || 'https://picsum.photos/60/60?random=1',
      followers: creator.followers_count,
      verified: false,
      rank: creator.rank,
    }));
  };

  useEffect(() => {
    const fetchCreatorList = async () => {
      try {
        const response = await getCreatorList();
        console.log(response);
        setCreatorList(convertToCreators(response));
      } catch (error) {
        console.error('Error fetching creator list:', error);
      }
    };
    fetchCreatorList();
  }, []);

  const handleCreatorClick = (username: string) => {
    navigate(`/profile?username=${username}`);
  };

  return (
    <div className="w-full max-w-screen-md mx-auto bg-white space-y-6 pt-16">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <CreatorsSection
          title="ユーザー一覧"
          creators={creatorList}
          showRank={false}
          onCreatorClick={handleCreatorClick}
          showMoreButton={false}
          scrollable={false}
        />
        <BottomNavigation />
      </div>
    </div>
  );
};

export default CreatorList;
