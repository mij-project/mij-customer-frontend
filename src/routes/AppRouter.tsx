// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAgeVerification } from '@/contexts/AgeVerificationContext';

// 年齢確認ページ
import Confirmation from '@/components/confirmation/confirmation';

// スクロールリセットページ
import ScrollToTop from '@/components/common/ScrollToTop';

// トップページ
import Top from '@/pages/top/Top';

// 投稿画面
import ShareVideo from '@/pages/share/post/SharePost';

// ダッシュボードページ
import Dashboard from '@/pages/account/personal/Dashborad';

// プロフィールページ
import Profile from '@/pages/account/profile/Profile';
import ProfileEdit from '@/pages/account/profile/ProfileEdit';

// 投稿ページ
import PostList from '@/pages/account/post/PostList';
import PostEdit from '@/pages/account/post/PostEdit';
import AccountPostDetail from '@/pages/account/post/PostDetail';
import BoughtPost from '@/pages/account/social/BoughtPost';
import BookmartPost from '@/pages/account/social/BookmarkPost';
import LikePost from '@/pages/account/social/LikePost';

// 設定ページ
import PhoneAuth from '@/pages/account/setting/PhoneAuth';
import Setting from '@/pages/account/setting/Setting';
import Email from '@/pages/account/setting/Email';
import Phone from '@/pages/account/setting/Phone';
import EmailNotification from '@/pages/account/setting/EmailNotification';
import Payment from '@/pages/account/setting/Payment';
import PlanList from '@/pages/account/setting/PlanList';
import Sale from '@/pages/account/setting/Sale';
import SaleWithDraw from '@/pages/account/setting/SaleWithDraw';
import Contact from '@/pages/account/setting/Contact';
import ResetPassword from '@/pages/auth/ResetPassword';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import CreaterType from '@/pages/account/setting/CreaterType';

// サインアップページ
import Login from '@/pages/signUp/Login';
import SingUp from '@/pages/signUp/SingUp';
import ConfirmationEmail from '@/pages/signUp/ConfirmationEmail';

// クリエイター登録ページ
import CreatorList from '@/pages/creator/CreatorList';
import CreatorRequest from '@/pages/creator/CreatorRequest';

// ランキングページ
import FeedSample from '@/pages/feed/FeedSample';
import PostRanking from '@/pages/post/PostRanking';
import CategoryBySlug from '@/pages/category/CategoryBySlug';
import CategoryList from '@/pages/category/CategoryList';
import PostNewArrivals from '@/pages/post/postNewArrivals';

// プランページ
import PlanPostList from '@/pages/plan/PlanPostList';
import PlanDetail from '@/pages/plan/PlanDetail';
import PlanMyList from '@/pages/plan/PlanMyList';
import PlanCreate from '@/pages/plan/PlanCreate';
import PlanEdit from '@/pages/plan/PlanEdit';
import PlanDelete from '@/pages/plan/PlanDelete';
import PlanSubscriberList from '@/pages/plan/PlanSubscriberList';
import PlanOrderChange from '@/pages/plan/PlanOrderChange';

// 妄想の間ページ
import DelusionMessage from '@/pages/message/DelusionMessage';

// 投稿詳細ページ
import PostDetail from '@/pages/post/postDetail';

// 法律ページ
import Terms from '@/pages/legal/Terms';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import LegalNotice from '@/pages/legal/LegalNotice';

// 検索ページ
import Search from '@/pages/Search/Search';

// 通知ページ
import Notifications from '@/pages/notification/Notifications';

// プライベートルート
import PrivateRoute from '@/routes/PrivateRoute';

// 認証コールバックページ
import AuthCallback from '@/components/auth/AuthCallback';
import XAuthCallback from '@/pages/auth/XAuthCallback';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import CreatorRanking from '@/pages/creator/CreatorRanking';
import PostRankingDetail from '@/pages/post/PostRankingDetail';
import CreatorRankingDetail from '@/pages/creator/CreatorRankingDetail';
import NotificationDetail from '@/pages/notification/NotificationDetail';

// 会社登録ページ
import CompanySignUp from '@/pages/signUp/CompanySignUp';

export default function AppRouter() {
  const { showVerification } = useAgeVerification();

  // 年齢確認が必要な場合は確認画面を表示
  if (showVerification) {
    return <Confirmation />;
  }

  return (
    <>
      {/* ページ遷移時のスクロールリセット */}
      <ScrollToTop />

      <Routes>
        {/* 公開ページ */}
        <Route path="/" element={<Top />} />

        {/* 認証ページ */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/x/callback" element={<XAuthCallback />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* カテゴリページ */}
        <Route path="/category" element={<CategoryBySlug />} />
        <Route path="/category/list" element={<CategoryList />} />

        {/* 投稿ページ */}
        <Route path="/share/video" element={
          <PrivateRoute>
            <ShareVideo />
          </PrivateRoute>
        } />
        <Route path="/share/post" element={
          <PrivateRoute>
            <ShareVideo />
          </PrivateRoute>
        } />

        {/* ログインページ */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SingUp />} />
        <Route path="/signup/confirmation-email" element={<ConfirmationEmail />} />

        {/* 妄想の種ページ */}
        <Route path="/message/delusion" element={
          <PrivateRoute>
            <DelusionMessage />
          </PrivateRoute>
        } />

        {/* フィードページ */}
        <Route path="/feed" element={<FeedSample />} />

        {/* ランキングページ */}
        <Route path="/ranking/posts" element={<PostRanking />} />
        <Route path="/ranking/posts/:type" element={<PostRankingDetail />} />
        <Route path="/ranking/creators" element={<CreatorRanking />} />
        <Route path="/ranking/creators/detail" element={<CreatorRankingDetail />} />
        <Route path="/post/new-arrivals" element={<PostNewArrivals />} />
        <Route path="/post/detail" element={<PostDetail />} />

        {/* アカウントページ */}
        <Route path="/account" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* 購入済みページ */}
        <Route path="/account/bought/post" element={
          <PrivateRoute>
            <BoughtPost />
          </PrivateRoute>
        } />

        {/* 保存済みページ */}
        <Route path="/account/bookmark/post" element={
          <PrivateRoute>
            <BookmartPost />
          </PrivateRoute>
        } />

        {/* いいね済みページ */}
        <Route path="/account/like/post" element={
          <PrivateRoute>
            <LikePost />
          </PrivateRoute>
        } />

        {/* プロフィールページ */}
        <Route path="/profile" element={<Profile />} />

        {/* プロフィール編集ページ */}
        <Route path="/account/edit" element={
          <PrivateRoute>
            <ProfileEdit />
          </PrivateRoute>
        } />
        <Route path="/account/settings" element={
          <PrivateRoute>
            <Setting />
          </PrivateRoute>
        } />

        {/* 投稿ページ */}
        <Route path="/account/post" element={
          <PrivateRoute>
            <PostList />
          </PrivateRoute>
        } />
        <Route path="/account/post/:postId" element={
          <PrivateRoute>
            <AccountPostDetail />
          </PrivateRoute>
        } />
        <Route path="/account/post/:postId/edit" element={
          <PrivateRoute>
            <PostEdit />
          </PrivateRoute>
        } />
        <Route path="/account/sale" element={
          <PrivateRoute>
            <Sale />
          </PrivateRoute>
        } />
        <Route path="/account/sale-withdraw" element={
          <PrivateRoute>
            <SaleWithDraw />
          </PrivateRoute>
        } />

        {/* 法律ページ */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notification/:notificationId" element={<NotificationDetail />} />
        {/* プランページ */}
        <Route path="/account/plan-list" element={
          <PrivateRoute>
            <PlanList />
          </PrivateRoute>
        } />
        <Route path="/plan/create" element={
          <PrivateRoute>
            <PlanCreate />
          </PrivateRoute>
        } />

        {/* 設定ページ */}
        <Route path="/account/setting/email" element={
          <PrivateRoute>
            <Email />
          </PrivateRoute>
        } />
        <Route path="/account/setting/phone" element={
          <PrivateRoute>
            <Phone />
          </PrivateRoute>
        } />
        <Route path="/account/setting/email-notification" element={
          <PrivateRoute>
            <EmailNotification />
          </PrivateRoute>
        } />
        <Route path="/account/payment" element={
          <PrivateRoute>
            <Payment />
          </PrivateRoute>
        } />
        <Route path="/account/contact" element={
          <PrivateRoute>
            <Contact />
          </PrivateRoute>
        } />
        <Route path="/plan/post/list" element={
          <PrivateRoute>
            <PlanPostList />
          </PrivateRoute>
        } />
        <Route path="/plan/:plan_id" element={
          <PrivateRoute>
            <PlanDetail />
          </PrivateRoute>
        } />
        <Route path="/account/phone-auth" element={
          <PrivateRoute>
            <PhoneAuth />
          </PrivateRoute>
        } />
        <Route path="/account/plan" element={
          <PrivateRoute>
            <PlanMyList />
          </PrivateRoute>
        } />

        {/* サインアップ会社ページ */}
        <Route path="/signup/:company_code" element={<CompanySignUp />} />

        <Route
          path="/plan/delete/:plan_id"
          element={
            <PrivateRoute>
              <PlanDelete />
            </PrivateRoute>
          }
        />
        <Route
          path="/plan/subscriber/:plan_id"
          element={
            <PrivateRoute>
              <PlanSubscriberList />
            </PrivateRoute>
          }
        />
        <Route
          path="/plan/reorder"
          element={
            <PrivateRoute>
              <PlanOrderChange />
            </PrivateRoute>
          }
        />
        <Route
          path="/creator/request"
          element={
            <PrivateRoute>
              <CreatorRequest />
            </PrivateRoute>
          }
        />
        <Route path="/creator/list" element={<CreatorList />} />
        <Route path="/account/creator-type" element={
          <PrivateRoute>
            <CreaterType />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}
