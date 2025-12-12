import apiClient from '@/api/axios';

/**
 * 広告会社アクセストラッキング
 */
export const trackAgencyAccess = async (referralCode: string, landingPage?: string) => {
  try {
    const response = await apiClient.post('/tracking/track-access', {
      referral_code: referralCode,
      landing_page: landingPage,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to track agency access:', error);
    // エラーが発生しても処理は続行（トラッキングは補助的な機能）
    return { success: false };
  }
};
