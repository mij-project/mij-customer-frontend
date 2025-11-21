import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Bell, MessageCircle, Heart, Users, Settings, Gift, Dot, ArrowLeft } from 'lucide-react';
import {
  getNotificationUnreadCount,
  getNotifications as getNotificationsAPI,
  readNotification,
} from '@/api/endpoints/notifications';
import { LoadingSpinner } from '@/components/common';
import { NotificationCard } from '@/components/common/NotificationCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { Button } from '@/components/ui/button';
import convertDatetimeToLocalTimezone from '@/utils/convertDatetimeToLocalTimezone';

interface Notification {
  id: string;
  type: number;
  is_read?: boolean;
  payload: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[] | []>([]);
  const [selectedTab, setSelectedTab] = useState<'system' | 'users' | 'payments' | 'all'>('all');
  const [hasUnreadSystem, setHasUnreadSystem] = useState(false);
  const [hasUnreadUsers, setHasUnreadUsers] = useState(false);
  const [hasUnreadPayments, setHasUnreadPayments] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  const getNotifications = async (
    type: 'system' | 'users' | 'payments' | 'all',
    page: number,
    perPage: number = 20,
    append: boolean = false
  ) => {
    setLoading(true);
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const [notificationsResponse, notificationUnreadCountResponse] = await Promise.all([
        getNotificationsAPI(type, page, perPage),
        getNotificationUnreadCount(),
      ]);
      if (notificationUnreadCountResponse.data.admin > 0) {
        setHasUnreadSystem(true);
      }
      if (notificationUnreadCountResponse.data.users > 0) {
        setHasUnreadUsers(true);
      }
      if (notificationUnreadCountResponse.data.payments > 0) {
        setHasUnreadPayments(true);
      }
      setNotifications((prev) =>
        append
          ? [...prev, ...notificationsResponse.notifications]
          : notificationsResponse.notifications
      );
      setHasNext(notificationsResponse.has_next);
      setTotal(notificationsResponse.total);
    } catch (error) {
      console.error('Notifications error', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    getNotifications(selectedTab, page, 20, false);
  }, [selectedTab]);

  useEffect(() => {
    if (page === 1) return;
    getNotifications(selectedTab, page, 20, true);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNext, loadingMore]);

  const handleNotificationClick = async (
    type: 'system' | 'users' | 'payments' | 'all',
    notification: Notification
  ) => {
    if (!user) return;
    if (type === 'system') {
      handleNotificationClickSystem(notification);
    } else if (type === 'users') {
      handleNotificationClickUsers(notification);
    } else if (type === 'payments') {
      handleNotificationClickPayments(notification);
    } else if (type === 'all') {
      handleNotificationClickAll(notification);
    }
  };

  const handleNotificationClickSystem = async (notification: Notification) => {
    if (!notification.is_read) {
      await readNotification("system", notification.id, user.id);
      navigate(`/notification/${notification.id}`, { state: { notification } });
      return;
    }
    navigate(`/notification/${notification.id}`, { state: { notification } });
  };

  const handleNotificationClickUsers = async (notification: Notification) => {
    if (!notification.is_read) {
      await readNotification("users", notification.id, user.id);
      if (notification.payload.type && (notification.payload.type === "identity" || notification.payload.type === "post")) {
        navigate(`/notification/${notification.id}`, { state: { notification } });
        return;
      }
      navigate(notification.payload.redirect_url);
      return;
    }
    if (notification.payload.type && (notification.payload.type === "identity" || notification.payload.type === "post")) {
      navigate(`/notification/${notification.id}`, { state: { notification } });
      return;
    }
    navigate(notification.payload.redirect_url);
  };

  const handleNotificationClickPayments = async (notification: Notification) => {
    if (!notification.is_read) {
      await readNotification("payments", notification.id, user.id);
      navigate(notification.payload.redirect_url, { state: { notification } });
      return;
    }
    navigate(notification.payload.redirect_url, { state: { notification } });
  };

  const handleNotificationClickAll = async (notification: Notification) => {
    if (notification.type == 1) {
      handleNotificationClickSystem(notification);
    } else if (notification.type == 2) {
      handleNotificationClickUsers(notification);
    } else if (notification.type == 3) {
      handleNotificationClickPayments(notification);
    }
  };

  const convertNotificationsForAll = (notifications: Notification[]) => {
    return notifications.map((notification) => ({
      ...notification,
      is_read: notification.type == 1 ? (user && notification.payload.users?.includes(user?.id)) || false : notification.is_read,
    }));
  };

  const convertNotificationsForSystem = (notifications: Notification[]) => {
    return notifications.map((notification) => ({
      ...notification,
      is_read: (user && notification.payload.users?.includes(user?.id)) || false,
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* <Header /> */}

      <div className="max-w-md mx-auto pb-20">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4 pt-4 pb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">お知らせ</h1>
          </div>
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex justify-center">
              <div className="inline-flex w-full rounded p-1 space-x-1">
                {/* あなたへ */}
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded transition-colors ${selectedTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-1">すべて</span>
                  {hasUnreadUsers && selectedTab !== 'all' && (
                    <span className="absolute">
                      <Dot className="w-8 h-8 text-red-500" />
                    </span>
                  )}
                </button>
                {/* 事務局 */}
                <button
                  onClick={() => setSelectedTab('system')}
                  className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded transition-colors ${selectedTab === 'system'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-1">運営</span>
                  {hasUnreadSystem && selectedTab !== 'system' && (
                    <span className="absolute">
                      <Dot className="w-8 h-8 text-red-500" />
                    </span>
                  )}
                </button>


                {/* 支払い通知 */}
                <button
                  onClick={() => setSelectedTab('payments')}
                  className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded transition-colors ${selectedTab === 'payments'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-1">収益</span>
                  {hasUnreadPayments && selectedTab !== 'payments' && (
                    <span className="absolute">
                      <Dot className="w-8 h-8 text-red-500" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Content Navigation */}
        <div className="bg-white space-y-4">
          {loading && (
            <div className="bg-white flex flex-col items-center justify-center">
              <LoadingSpinner />
            </div>
          )}

          {/* Notifications System Section */}
          {selectedTab === 'system' &&
            !loading &&
            (notifications.length > 0 ?
              (convertNotificationsForSystem(notifications).map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.payload.title}
                  subtitle={notification.payload.subtitle}
                  date={convertDatetimeToLocalTimezone(notification.created_at).split(' ')[0]}
                  time={convertDatetimeToLocalTimezone(notification.created_at).split(' ')[1].substring(0, 5)}
                  is_read={notification.is_read}
                  onClick={() => handleNotificationClick('system', notification)}
                />
              ))) : (
                <NotificationCard
                  is_empty={true}
                  id={''}
                  title={''}
                  date={''}
                  time={''}
                  onClick={() => { }}
                />
              )
            )
          }
          {/* Notifications Users Section */}
          {selectedTab === 'all' &&
            !loading &&
            (notifications.length > 0 ? (
              convertNotificationsForAll(notifications).map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.payload.title}
                  avatarUrl={notification.payload.avatar}
                  date={convertDatetimeToLocalTimezone(notification.created_at).split(' ')[0]}
                  time={convertDatetimeToLocalTimezone(notification.created_at).split(' ')[1].substring(0, 5)}
                  is_read={notification.is_read}
                  onClick={() => handleNotificationClick('all', notification)}
                />
              ))
            ) : (
              <NotificationCard
                is_empty={true}
                id={''}
                title={''}
                date={''}
                time={''}
                onClick={() => { }}
              />
            ))}
          {/* Notifications Payments Section */}
          {selectedTab === 'payments' &&
            !loading &&
            (notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.payload.title}
                  avatarUrl={notification.payload.avatar}
                  date={convertDatetimeToLocalTimezone(notification.created_at).split(' ')[0]}
                  time={convertDatetimeToLocalTimezone(notification.created_at).split(' ')[1].substring(0, 5)}
                  is_read={notification.is_read}
                  onClick={() => handleNotificationClick('payments', notification)}
                />
              ))
            ) : (
              <NotificationCard
                is_empty={true}
                id={''}
                title={''}
                date={''}
                time={''}
                onClick={() => { }}
              />
            ))}
        </div>
      </div>

      {loadingMore && (
        <div className="py-2 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {hasNext && <div ref={observerTarget} className="h-4" />}

      <BottomNavigation />
    </div>
  );
}
