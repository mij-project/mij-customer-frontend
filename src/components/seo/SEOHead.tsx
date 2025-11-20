// src/components/seo/SEOHead.tsx
import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'video.other';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  rating?: 'general' | 'adult';
  canonical?: string;
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://mijfans.jp';

const DEFAULT_SEO: Required<
  Omit<SEOProps, 'publishedTime' | 'modifiedTime' | 'section' | 'tags' | 'canonical' | 'author'>
> = {
  title: 'mijfans',
  description: '世界へ飛び立つファンクラブプラットフォーム',
  keywords:
    'mijfans,ミジファン,クリエイター,ファンクラブ,動画配信,有料コンテンツ,サブスクリプション,個人撮影,オリジナルコンテンツ',
  image: `${BASE_URL}/assets/mijfans.png`,
  url: BASE_URL,
  type: 'website',
  noIndex: false,
  noFollow: false,
  rating: 'general',
};

/**
 * SEO対応のためのメタタグを動的に設定するコンポーネント
 *
 * @example
 * ```tsx
 * <SEOHead
 *   title="クリエイター一覧"
 *   description="人気クリエイターのプロフィールを閲覧"
 *   type="website"
 * />
 * ```
 */
export default function SEOHead(props: SEOProps) {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = DEFAULT_SEO.type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noIndex = DEFAULT_SEO.noIndex,
    noFollow = DEFAULT_SEO.noFollow,
    rating = DEFAULT_SEO.rating,
    canonical,
  } = props;

  // 完全なタイトルを生成（サイト名を自動追加）
  const fullTitle = title.includes('mijfans') ? title : `${title} | mijfans`;

  useEffect(() => {
    // Basic Meta Tags
    document.title = fullTitle;
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'author', author || 'mijfans');

    // Rating (アダルトコンテンツ制御)
    if (rating === 'adult') {
      updateMetaTag('name', 'rating', 'adult');
      updateMetaTag('name', 'content-rating', 'mature');
    } else {
      updateMetaTag('name', 'rating', 'general');
      removeMetaTag('name', 'content-rating');
    }

    // Robots (noindex/nofollow)
    const robotsContent = [noIndex ? 'noindex' : 'index', noFollow ? 'nofollow' : 'follow'].join(
      ', '
    );
    updateMetaTag('name', 'robots', robotsContent);
    updateMetaTag('name', 'googlebot', robotsContent);

    // Canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    } else {
      updateLinkTag('canonical', url);
    }

    // Open Graph (OGP) Tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:site_name', 'mijfans');
    updateMetaTag('property', 'og:locale', 'ja_JP');

    // Article-specific OGP
    if (type === 'article') {
      if (publishedTime) updateMetaTag('property', 'article:published_time', publishedTime);
      if (modifiedTime) updateMetaTag('property', 'article:modified_time', modifiedTime);
      if (section) updateMetaTag('property', 'article:section', section);
      if (author) updateMetaTag('property', 'article:author', author);
      if (tags) {
        // Remove existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove());
        // Add new tags
        tags.forEach((tag) => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }
    }

    // Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);
    updateMetaTag('name', 'twitter:site', '@mijfan_official');
    updateMetaTag('name', 'twitter:creator', '@mijfan_official');

    // Mobile & Theme
    updateMetaTag('name', 'theme-color', '#000000');
    updateMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');
  }, [
    fullTitle,
    description,
    keywords,
    image,
    url,
    type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noIndex,
    noFollow,
    rating,
    canonical,
  ]);

  return null; // このコンポーネントは何もレンダリングしない
}

/**
 * メタタグを更新または作成する関数
 */
function updateMetaTag(attr: 'name' | 'property', key: string, value: string) {
  let element = document.querySelector(`meta[${attr}="${key}"]`);

  if (element) {
    element.setAttribute('content', value);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    element.setAttribute('content', value);
    document.head.appendChild(element);
  }
}

/**
 * メタタグを削除する関数
 */
function removeMetaTag(attr: 'name' | 'property', key: string) {
  const element = document.querySelector(`meta[${attr}="${key}"]`);
  if (element) {
    element.remove();
  }
}

/**
 * linkタグを更新または作成する関数（canonical等）
 */
function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (element) {
    element.href = href;
  } else {
    element = document.createElement('link');
    element.rel = rel;
    element.href = href;
    document.head.appendChild(element);
  }
}
