import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface OgpMetaProps {
  /** ページタイトル */
  title: string;
  /** ページ説明 */
  description: string;
  /** ページURL（省略時は現在のURL） */
  url?: string;
  /** OGP画像URL */
  imageUrl?: string | null;
  /** OGPタイプ（article, profile, website等） */
  type?: 'article' | 'profile' | 'website';
  /** Twitter Cardタイプ */
  twitterCard?: 'summary' | 'summary_large_image';
}

/**
 * OGPメタタグを設定するコンポーネント
 * X (Twitter)、LINE、FacebookなどのSNSでのシェア時に適切な情報を表示します
 */
export default function OgpMeta({
  title,
  description,
  url = window.location.href,
  imageUrl,
  type = 'website',
  twitterCard = 'summary_large_image',
}: OgpMetaProps) {
  console.log('OgpMeta imageUrl:', imageUrl);

  return (
    <Helmet>
      {/* 基本メタタグ */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OGP メタタグ */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="mijfans" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:secure_url" content={imageUrl} />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1080" />
          <meta property="og:image:height" content="1080" />
          <meta property="og:image:alt" content={title} />
        </>
      )}

      {/* Twitter Card メタタグ */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
}
