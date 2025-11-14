import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import SitemapPlugin from 'vite-plugin-sitemap'
import path from 'path'

// ここは本番公開URLに合わせてください
const BASE_URL = 'https://mijfans.jp'

// 静的ページのルート定義（SEO対象）
const STATIC_ROUTES = [
  // トップページ（最優先）
  '/',

  // 法的情報ページ（重要度: 高）
  '/terms',
  '/privacy-policy',
  '/legal-notice',

  // 公開コンテンツページ
  '/ranking/posts',
  '/post/new-arrivals',
  '/feed',
  '/creator/list',
  '/search',
]

// Vite 設定
export default defineConfig({
  plugins: [
    react(),

    // 🔽 ビルド時に dist/sitemap.xml を生成
    SitemapPlugin({
      hostname: BASE_URL,
      dynamicRoutes: STATIC_ROUTES,
      changefreq: 'weekly',
      priority: 0.8,
    }),
  ],

  server: {
    port: 3000,
  },

  // パスエイリアス設定
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // publicディレクトリの明示的設定
  publicDir: 'public',

  // S3/CloudFront 配信を想定
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true, // ビルド前にdistディレクトリをクリーンアップ
  },

  // CloudFront のパス配信事情で base を使っている場合はここで調整
  // base: '/',
})
