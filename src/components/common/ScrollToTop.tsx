import { useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const SCROLL_POSITION_KEY = 'mij_scroll_positions';

// メモリキャッシュ（sessionStorageアクセスを最小化）
let positionsCache: Record<string, number> | null = null;

/**
 * スクロール位置を取得（キャッシュ優先）
 */
function getScrollPositions(): Record<string, number> {
  if (positionsCache !== null) {
    return positionsCache;
  }
  try {
    const data = sessionStorage.getItem(SCROLL_POSITION_KEY);
    positionsCache = data ? JSON.parse(data) : {};
    return positionsCache;
  } catch {
    positionsCache = {};
    return positionsCache;
  }
}

/**
 * スクロール位置を保存
 */
function saveScrollPosition(key: string, position: number): void {
  const positions = getScrollPositions();
  positions[key] = position;
  positionsCache = positions;
  try {
    sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
  } catch {
    // 無視
  }
}

/**
 * スクロール位置を削除
 */
function removeScrollPosition(key: string): void {
  const positions = getScrollPositions();
  delete positions[key];
  positionsCache = positions;
  try {
    sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
  } catch {
    // 無視
  }
}

/**
 * ページ遷移時に画面トップにスクロールするコンポーネント
 * ブラウザの「戻る」「進む」操作時は保存されたスクロール位置を復元
 */
export default function ScrollToTop() {
  const { pathname, search, key } = useLocation();
  const navigationType = useNavigationType();
  const isRestoringRef = useRef(false);
  const scrollYRef = useRef(0);
  const locationKeyRef = useRef('');

  // ページの一意キー
  const locationKey = key || pathname + search;

  // 遷移前にスクロール位置を保存（useLayoutEffectで同期的に実行）
  useLayoutEffect(() => {
    // 前のページのスクロール位置を保存
    if (locationKeyRef.current && locationKeyRef.current !== locationKey) {
      saveScrollPosition(locationKeyRef.current, scrollYRef.current);
    }
    locationKeyRef.current = locationKey;
  }, [locationKey]);

  // スクロール位置を常に追跡
  useEffect(() => {
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        scrollYRef.current = window.scrollY;
      }
    };

    // 初期値を設定
    scrollYRef.current = window.scrollY;

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ページ遷移時の処理
  useEffect(() => {
    if (navigationType === 'POP') {
      // 戻る/進む: スクロール位置を復元
      const positions = getScrollPositions();
      const savedPosition = positions[locationKey];

      if (savedPosition !== undefined && savedPosition > 0) {
        isRestoringRef.current = true;

        // iOS Safari対応: DOMの準備を待ってから復元
        const restoreScroll = () => {
          let attempts = 0;
          const maxAttempts = 15;

          const tryRestore = () => {
            attempts++;

            // ページの高さが復元位置より大きくなるまで待つ
            const canScroll =
              document.documentElement.scrollHeight > savedPosition + window.innerHeight / 2;

            if (canScroll || attempts >= maxAttempts) {
              window.scrollTo(0, savedPosition);

              // 復元確認と再試行
              requestAnimationFrame(() => {
                const diff = Math.abs(window.scrollY - savedPosition);
                if (diff > 50 && attempts < maxAttempts) {
                  setTimeout(tryRestore, 100);
                } else {
                  isRestoringRef.current = false;
                }
              });
            } else {
              // コンテンツがまだ読み込まれていない場合は待機
              setTimeout(tryRestore, 100);
            }
          };

          // 最初の試行を少し遅らせる（DOMの構築を待つ）
          setTimeout(tryRestore, 50);
        };

        restoreScroll();
      } else {
        isRestoringRef.current = false;
      }
    } else {
      // 新規遷移: 上部へスクロール
      window.scrollTo(0, 0);
      removeScrollPosition(locationKey);
      scrollYRef.current = 0;
    }
  }, [locationKey, navigationType]);

  return null;
}
