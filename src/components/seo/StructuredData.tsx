// src/components/seo/StructuredData.tsx
import { useEffect } from 'react';

export interface OrganizationSchema {
  type: 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export interface WebsiteSchema {
  type: 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface PersonSchema {
  type: 'Person';
  name: string;
  url: string;
  image?: string;
  description?: string;
  jobTitle?: string;
}

export interface VideoObjectSchema {
  type: 'VideoObject';
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  interactionStatistic?: {
    '@type': string;
    interactionType: string;
    userInteractionCount: number;
  }[];
}

export interface BreadcrumbListSchema {
  type: 'BreadcrumbList';
  itemListElement: {
    '@type': string;
    position: number;
    name: string;
    item: string;
  }[];
}

type StructuredDataProps =
  | OrganizationSchema
  | WebsiteSchema
  | PersonSchema
  | VideoObjectSchema
  | BreadcrumbListSchema;

/**
 * Schema.org構造化データを生成するコンポーネント
 * JSON-LD形式でページに埋め込む
 */
export default function StructuredData(props: StructuredDataProps) {
  useEffect(() => {
    const schema = generateSchema(props);

    // 既存の構造化データスクリプトを削除
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // 新しい構造化データスクリプトを追加
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // クリーンアップ
    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [props]);

  return null;
}

/**
 * スキーマタイプに応じて適切なJSON-LDを生成
 */
function generateSchema(props: StructuredDataProps) {
  const baseContext = 'https://schema.org';

  switch (props.type) {
    case 'Organization':
      return {
        '@context': baseContext,
        '@type': 'Organization',
        name: props.name,
        url: props.url,
        logo: props.logo,
        description: props.description,
        sameAs: props.sameAs || [],
      };

    case 'WebSite':
      return {
        '@context': baseContext,
        '@type': 'WebSite',
        name: props.name,
        url: props.url,
        potentialAction: props.potentialAction || {
          '@type': 'SearchAction',
          target: `${props.url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };

    case 'Person':
      return {
        '@context': baseContext,
        '@type': 'Person',
        name: props.name,
        url: props.url,
        image: props.image,
        description: props.description,
        jobTitle: props.jobTitle || 'Creator',
      };

    case 'VideoObject':
      return {
        '@context': baseContext,
        '@type': 'VideoObject',
        name: props.name,
        description: props.description,
        thumbnailUrl: props.thumbnailUrl,
        uploadDate: props.uploadDate,
        duration: props.duration,
        contentUrl: props.contentUrl,
        embedUrl: props.embedUrl,
        interactionStatistic: props.interactionStatistic || [],
      };

    case 'BreadcrumbList':
      return {
        '@context': baseContext,
        '@type': 'BreadcrumbList',
        itemListElement: props.itemListElement,
      };

    default:
      return {};
  }
}
