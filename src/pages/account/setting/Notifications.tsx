import React, { useState } from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Bell, MessageCircle, Heart, Users, Settings, Gift } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'gift';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  userName?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'いいねされました',
    message: 'あなたの投稿に田中さんがいいねしました',
    timestamp: '2時間前',
    isRead: false,
    avatar: '/assets/no-image.svg',
    userName: '田中さん',
  },
  {
    id: '2',
    type: 'comment',
    title: 'コメントされました',
    message: '佐藤さんがあなたの投稿にコメントしました',
    timestamp: '4時間前',
    isRead: false,
    avatar: '/assets/no-image.svg',
    userName: '佐藤さん',
  },
  {
    id: '3',
    type: 'follow',
    title: 'フォローされました',
    message: '山田さんがあなたをフォローしました',
    timestamp: '1日前',
    isRead: true,
    avatar: '/assets/no-image.svg',
    userName: '山田さん',
  },
  {
    id: '4',
    type: 'system',
    title: 'システム通知',
    message: '新しい機能が追加されました。ぜひご利用ください！',
    timestamp: '2日前',
    isRead: true,
  },
  {
    id: '5',
    type: 'gift',
    title: 'ギフトが届きました',
    message: '鈴木さんからギフトが届きました',
    timestamp: '3日前',
    isRead: true,
    avatar: '/assets/no-image.svg',
    userName: '鈴木さん',
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'follow':
      return <Users className="h-5 w-5 text-green-500" />;
    case 'system':
      return <Settings className="h-5 w-5 text-gray-500" />;
    case 'gift':
      return <Gift className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    selectedTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-md mx-auto pt-16 pb-20">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">お知らせ</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedTab('unread')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedTab === 'unread'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                未読
              </button>
            </div>

            {/* Mark all as read button */}
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                すべて既読にする
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt={notification.userName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {selectedTab === 'unread' ? '未読の通知はありません' : '通知はありません'}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
