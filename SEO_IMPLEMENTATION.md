# SEO実装ドキュメント

## 📋 実装概要

mijfansのSEO対策として、以下の実装を行いました：

1. **robots.txt** - クローラーのアクセス制御
2. **sitemap.xml** - 検索エンジン向けサイトマップ
3. **SEOHeadコンポーネント** - 各ページへのメタタグ設定

---

## 🤖 robots.txt

### 場所
`/public/robots.txt`

### 内容
- **許可**: カテゴリ、プロフィール、投稿詳細などの公開ページ
- **拒否**: 管理画面、認証ページ、アカウント設定など
- **サイトマップ**: `https://mijfans.jp/sitemap.xml`

### 設定されているルール
```
Allow: /
Allow: /category
Allow: /account/profile
Allow: /post/detail
Allow: /creator
Allow: /ranking

Disallow: /account/settings
Disallow: /account/edit
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
```

---

## 🗺️ sitemap.xml

### 場所
`/public/sitemap.xml`

### 含まれるURL
- **静的ページ**: トップページ、クリエイター一覧、ランキング
- **カテゴリページ**: 例）`/category?slug=personal-shooting`
- **プロフィールページ**: 例）`/account/profile?username=OQQOB`
- **法的ページ**: 利用規約、プライバシーポリシー、特定商取引法表記

### 優先度設定
| ページタイプ | changefreq | priority |
|-------------|-----------|----------|
| トップページ | daily | 1.0 |
| クリエイター一覧・ランキング | daily | 0.9 |
| カテゴリページ | weekly | 0.8 |
| プロフィールページ | weekly | 0.7 |
| 法的ページ | monthly | 0.5 |

---

## 🔍 SEOHeadコンポーネント

### 場所
`/src/components/seo/SEOHead.tsx`

### 機能
- タイトル、description、keywordsの設定
- robots メタタグ（index/noindex, follow/nofollow）
- カノニカルURLの設定
- OGPタグ（og:title, og:description, og:image等）
- Twitter Card対応

### 実装済みページ

#### 1. カテゴリページ
**ファイル**: `/src/pages/category/CategoryBySlug.tsx`

```tsx
<SEOHead
  title={`${categoryName}のクリエイター一覧`}
  description={`${categoryName}カテゴリのクリエイターコンテンツを探す`}
  canonical={`https://mijfans.jp/category?slug=${slug}`}
  keywords={['クリエイター', categoryName, 'ファンクラブ', 'サブスクリプション']}
  type="website"
  noIndex={false}
  noFollow={false}
/>
```

#### 2. プロフィールページ
**ファイル**: `/src/pages/account/profile/Profile.tsx`

```tsx
<SEOHead
  title={`${profile.profile_name} (@${profile.username})`}
  description={pageDescription}
  canonical={`https://mijfans.jp/account/profile?username=${profile.username}`}
  keywords={['クリエイター', profile.profile_name, profile.username, 'ファンクラブ']}
  image={ogpImageUrl}
  type="profile"
  noIndex={false}
  noFollow={false}
/>
```

#### 3. 法的ページ

**利用規約** (`/src/pages/legal/Terms.tsx`)
```tsx
<SEOHead
  title="利用規約"
  description="mijfansの利用規約。サービスのご利用にあたっての禁止事項、免責事項などを記載しています。"
  canonical="https://mijfans.jp/legal/terms"
  keywords={['利用規約', '規約', 'mijfans', '利用条件']}
  type="website"
  noIndex={false}
  noFollow={false}
/>
```

**プライバシーポリシー** (`/src/pages/legal/PrivacyPolicy.tsx`)
```tsx
<SEOHead
  title="プライバシーポリシー"
  description="mijfansのプライバシーポリシー。個人情報の取り扱い、Cookie利用、第三者提供などについて記載しています。"
  canonical="https://mijfans.jp/legal/privacy"
  keywords={['プライバシーポリシー', '個人情報保護', 'mijfans']}
  type="website"
  noIndex={false}
  noFollow={false}
/>
```

**特定商取引法表記** (`/src/pages/legal/LegalNotice.tsx`)
```tsx
<SEOHead
  title="特定商取引法に基づく表記"
  description="mijfansの特定商取引法に基づく表記。販売業者、運営責任者、所在地などの情報を記載しています。"
  canonical="https://mijfans.jp/legal/notice"
  keywords={['特定商取引法', '運営会社', 'mijfans']}
  type="website"
  noIndex={false}
  noFollow={false}
/>
```

---

## 📊 Google Search Console 登録手順

### 1. サイトの所有権確認
HTMLファイルアップロード方式、またはメタタグ方式で確認

### 2. サイトマップ送信
Google Search Consoleにログインし、以下のURLを送信：
```
https://mijfans.jp/sitemap.xml
```

### 3. URL検査
主要ページのURLをURL検査ツールで確認し、インデックス登録をリクエスト：
- `https://mijfans.jp/category?slug=personal-shooting`
- `https://mijfans.jp/account/profile?username=OQQOB`
- その他の重要ページ

---

## ⚠️ 重要な注意事項

### SPAの制限
現在の実装はクライアントサイドレンダリング（CSR）のため、以下の制限があります：

1. **SNSクローラーの制限**
   - TwitterやLINEなどのクローラーはJavaScriptを実行しない
   - 動的に設定されたOGPタグは認識されない
   - `index.html`のデフォルトOGPのみが表示される

2. **検索エンジンクローラー**
   - Googleは一部JavaScriptを実行するが、完全ではない
   - 初期HTMLに含まれるメタタグのみが確実に認識される

### 推奨される改善策

より本格的なSEO対応には、以下のいずれかの実装を検討：

1. **SSR (Server-Side Rendering)**
   - Next.jsへの移行
   - ページ表示時にサーバー側でHTMLを生成

2. **バックエンドでの動的HTML生成**
   - FastAPIで特定URLに対してOGP付きHTMLを返す
   - クローラーアクセス時のみ動的HTMLを提供

3. **プリレンダリング**
   - ビルド時に主要ページを静的生成
   - Prerender.ioなどのサービス利用

---

## 🔄 今後のタスク

- [ ] Google Search Consoleへのサイトマップ登録
- [ ] 主要ページのURL検査とインデックス登録リクエスト
- [ ] Google Analyticsの設定
- [ ] 構造化データ（Schema.org）の追加
- [ ] SSR/SSG対応の検討

---

**作成日**: 2025-01-17  
**更新日**: 2025-01-17
