// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAgeVerification } from '@/contexts/AgeVerificationContext';
import Confirmation from '@/components/confirmation/confirmation';
import ScrollToTop from '@/components/common/ScrollToTop';
import ResetPassword from '@/pages/auth/ResetPassword';

import Upload from '@/pages/Upload';
import ViewVideo from '@/pages/ViewVideo';
import Top from '@/pages/top/Top';
import ShareVideo from '@/pages/share/post/SharePost';
import CreatorProfile from '@/pages/qreator/CreatorProfile';
import Account from '@/pages/account/Account';
import AccountProfile from '@/pages/account/AccountProfile';
import AccountEdit from '@/pages/account/AccountEdit';
import AccountSetting from '@/pages/account/AccountSetting';
import AccountPost from '@/pages/account/AccountPost';
import AccountSale from '@/pages/account/AccountSale';
import AccountSaleWithDraw from '@/pages/account/AccountSaleWithDraw';
import AccountPlanSetting from '@/pages/account/AccountPlanSetting';
import AccountPlanList from '@/pages/account/AccountPlanList';
import AccountSettingEmail from '@/pages/account/AccountSettingEmail';
import AccountSettingPhone from '@/pages/account/AccountSettingPhone';
import AccountSettingEmailNotification from '@/pages/account/AccountSettingEmailNotification';
import AccountPayment from '@/pages/account/AccountPayment';
import AccountContact from '@/pages/account/AccountContact';
import AccountBoughtPost from '@/pages/account/AccountBoughtPost';
import AccountBookmartPost from '@/pages/account/AccountBookmartPost';
import AccountLikePost from '@/pages/account/AccountLikePost';
import Login from '@/pages/signUp/Login';
import SingUp from '@/pages/signUp/SingUp';

// クリエイター登録ページ
import CreatorList from '@/pages/qreator/CreatorList';
import QreatorRequest from '@/pages/qreator/QreatorRequest';
import QreatorRequestCertifierImage from '@/pages/qreator/QreatorRequestCertifierImage';
import QreatorRequestSmsVerification from '@/pages/qreator/QreatorRequestSmsVerification';
import QreatorRequestPersonalInfo from '@/pages/qreator/QreatorRequestPersonalInfo';
import QreatorRequestPlanSetup from '@/pages/qreator/QreatorRequestPlanSetup';

// ランキングページ
import FeedSample from '@/pages/feed/FeedSample';
import PostRanking from '@/pages/post/PostRanking';
import Category from '@/pages/category/Category';
import PostNewArrivals from '@/pages/post/postNewArrivals';

// 妄想の間ページ
import DelusionMessage from '@/pages/message/DelusionMessage';

// 投稿詳細ページ
import PostDetail from '@/pages/post/postDetail';
import SocialTest from '@/pages/test/SocialTest';
import Terms from '@/pages/legal/Terms';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import LegalNotice from '@/pages/legal/LegalNotice';
import Search from '@/pages/Search/Search';
import AccountNotifications from '@/pages/account/AccountNotifications';
import PrivateRoute from '@/routes/PrivateRoute';
import AuthCallback from '@/components/auth/AuthCallback';
import XAuthCallback from '@/pages/auth/XAuthCallback';
import VerifyEmail from '@/pages/auth/VerifyEmail';

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
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/x/callback" element={<XAuthCallback />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/category" element={<Category />} />
      <Route path="/view_video" element={<ViewVideo />} />
      <Route path="/share/video" element={<ShareVideo />} />
      <Route path="/share/post" element={<ShareVideo />} />
      <Route path="/creator/profile" element={<CreatorProfile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SingUp />} />
      <Route path="/message/delusion" element={<DelusionMessage />} />
      <Route path="/feed" element={<FeedSample />} />
      <Route path="/ranking/posts" element={<PostRanking />} />
      <Route path="/post/new-arrivals" element={<PostNewArrivals />} />
      <Route path="/post/detail" element={<PostDetail />} />
      <Route path="/test/social" element={<SocialTest />} />
        {/* 認証必須ページ（必要に応じて追加） */}
      <Route path="/upload_test" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/bought/post" element={<AccountBoughtPost />} />
      <Route path="/account/bookmart/post" element={<AccountBookmartPost />} />
      <Route path="/account/like/post" element={<AccountLikePost />} />
      <Route path="/account/profile" element={<AccountProfile />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/account/edit" element={<AccountEdit />} />
      <Route path="/account/settings" element={<AccountSetting />} />
      <Route path="/account/post" element={<AccountPost />} />
      <Route path="/account/sale" element={<AccountSale />} />
      <Route path="/account/sale-withdraw" element={<AccountSaleWithDraw />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/legal-notice" element={<LegalNotice />} />
      <Route path="/search" element={<Search />} />
      <Route path="/account/notifications" element={<AccountNotifications />} />
      <Route path="/account/plan-list" element={<AccountPlanList />} />
      <Route path="/account/setting/email" element={<AccountSettingEmail />} />
      <Route path="/account/setting/phone" element={<AccountSettingPhone />} />
      <Route path="/account/setting/email-notification" element={<AccountSettingEmailNotification />} />
      <Route path="/account/payment" element={<AccountPayment />} />
      <Route path="/account/contact" element={<AccountContact />} />
      <Route
        element={
            <AccountSaleWithDraw />
        }
      />
      
      <Route
        path="/account/plan"
        element={
            <AccountPlanSetting />
        }
      />
      <Route
        path="/creator/request"
        element={
          <PrivateRoute>
            <QreatorRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/creator/request/verification"
        element={
          <PrivateRoute>
            <QreatorRequestCertifierImage />
          </PrivateRoute>
        }
      />
      <Route path="/creator/list" element={<CreatorList />} />
      <Route
        path="/creator/request/sms"
        element={
          <PrivateRoute>
            <QreatorRequestSmsVerification 
              onNext={() => {}} 
              onBack={() => {}} 
              currentStep={2}
              totalSteps={5}
              steps={[
                { id: 1, title: '基本情報', completed: true, current: false },
                { id: 2, title: '本人確認', completed: false, current: true },
                { id: 3, title: '個人情報', completed: false, current: false },
                { id: 4, title: 'プラン設定', completed: false, current: false },
                { id: 5, title: '完了', completed: false, current: false }
              ]}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/creator/request/personal-info"
        element={
          <PrivateRoute>
            <QreatorRequestPersonalInfo 
              onNext={() => {}} 
              onBack={() => {}} 
              currentStep={3}
              totalSteps={5}
              steps={[
                { id: 1, title: '基本情報', completed: true, current: false },
                { id: 2, title: '本人確認', completed: true, current: false },
                { id: 3, title: '個人情報', completed: false, current: true },
                { id: 4, title: 'プラン設定', completed: false, current: false },
                { id: 5, title: '完了', completed: false, current: false }
              ]}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/creator/request/plan-setup"
        element={
          <PrivateRoute>
            <QreatorRequestPlanSetup 
              onNext={() => {}} 
              onBack={() => {}} 
              currentStep={4}
              totalSteps={5}
              steps={[
                { id: 1, title: '基本情報', completed: true, current: false },
                { id: 2, title: '本人確認', completed: true, current: false },
                { id: 3, title: '個人情報', completed: true, current: false },
                { id: 4, title: 'プラン設定', completed: false, current: true },
                { id: 5, title: '完了', completed: false, current: false }
              ]}
            />
          </PrivateRoute>
        }
      />
      </Routes>
    </>
  );
}
