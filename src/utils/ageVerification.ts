// 年齢確認のユーティリティ関数

const AGE_VERIFICATION_COOKIE = 'age_verified';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24時間（ミリ秒）

/**
 * 年齢確認済みかどうかをチェック
 */
export const isAgeVerified = (): boolean => {
  try {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(AGE_VERIFICATION_COOKIE + '='));

    if (!cookie) return false;

    const value = cookie.split('=')[1];
    const timestamp = parseInt(value, 10);

    if (isNaN(timestamp)) return false;

    const now = Date.now();
    const timeDiff = now - timestamp;

    // 24時間以内なら確認済み
    return timeDiff < TWENTY_FOUR_HOURS;
  } catch (error) {
    console.error('Age verification check error:', error);
    return false;
  }
};

/**
 * 年齢確認済みとして記録
 */
export const setAgeVerified = (): void => {
  try {
    const timestamp = Date.now().toString();
    const expires = new Date(Date.now() + TWENTY_FOUR_HOURS);

    document.cookie = `${AGE_VERIFICATION_COOKIE}=${timestamp}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  } catch (error) {
    console.error('Age verification set error:', error);
  }
};

/**
 * 年齢確認の記録をクリア
 */
export const clearAgeVerification = (): void => {
  try {
    document.cookie = `${AGE_VERIFICATION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error('Age verification clear error:', error);
  }
};

/**
 * 最後のアクセス時刻を更新（24時間の期限を延長）
 */
export const updateLastAccess = (): void => {
  if (isAgeVerified()) {
    setAgeVerified(); // 現在時刻で更新
  }
};
