/**
 * Lambda@Edge: 動的OGP生成ハンドラー
 *
 * SNSクローラー検知時に、/profile と /post/detail の動的OGPを生成
 *
 * CloudFront Distribution: Origin Request イベントで実行
 *
 * 注意: Lambda@Edgeは環境変数を使用できないため、
 *       環境判定はCloudFront Distribution IDで行います
 */

// CloudFront Distribution ID による環境判定
const ENVIRONMENTS = {
  // ステージング環境
  'E2BF051CTUBS9Y': {
    API_BASE_URL: 'https://stg-api.mijfans.jp',
    SITE_BASE_URL: 'https://stg.mijfans.jp',
  },
  // 本番環境
  'E2A91SB6ISPQW2': {
    API_BASE_URL: 'https://api.mijfans.jp',
    SITE_BASE_URL: 'https://mijfans.jp',
  },
};

// デフォルト設定（本番環境）
const DEFAULT_CONFIG = {
  API_BASE_URL: 'https://api.mijfans.jp',
  SITE_BASE_URL: 'https://mijfans.jp',
};

/**
 * SNSクローラーのUser-Agentパターン
 */
const SNS_CRAWLER_PATTERNS = [
  /twitterbot/i,
  /facebookexternalhit/i,
  /Slackbot/i,
  /WhatsApp/i,
  /line/i,
  /LinkedInBot/i,
  /Discordbot/i,
  /TelegramBot/i,
];

/**
 * User-AgentがSNSクローラーかどうかを判定
 */
function isSNSCrawler(userAgent) {
  if (!userAgent) return false;
  return SNS_CRAWLER_PATTERNS.some(pattern => pattern.test(userAgent));
}

/**
 * URLからクエリパラメータを抽出
 */
function getQueryParams(querystring) {
  if (!querystring) return {};

  const params = {};
  querystring.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });
  return params;
}

/**
 * 投稿詳細ページのOGPデータを取得
 */
async function fetchPostOGPData(postId, config) {
  try {
    // 投稿OGP情報を取得（1回のAPI呼び出しで全情報を取得）
    const ogpResponse = await fetch(`${config.API_BASE_URL}/post/${postId}/ogp-image`);
    if (!ogpResponse.ok) {
      throw new Error(`投稿OGP情報取得失敗: ${ogpResponse.status}`);
    }
    const ogpData = await ogpResponse.json();

    // クリエイター名を取得
    const creatorName = ogpData.creator?.profile_name || 'クリエイター';

    // タイトル生成: description の最初の10文字 | クリエイター名 | さんの限定コンテンツが見れる｜mijfans(ミジュファンズ)
    const postDescription = ogpData.description || '';
    const title = postDescription
      ? `${postDescription.substring(0, 10)}${postDescription.length > 10 ? '...' : ''} | ${creatorName}さんの限定コンテンツが見れる｜mijfans(ミジュファンズ)`
      : `${creatorName}さんの限定コンテンツが見れる｜mijfans(ミジュファンズ)`;

    // 説明文生成: description の最初の128文字 | クリエイター名 | さんの限定コンテンツが見れる｜mijfans(ミジュファンズ)
    const description = postDescription
      ? `${postDescription.substring(0, 128)}${postDescription.length > 128 ? '...' : ''} | ${creatorName}さんの限定コンテンツが見れる｜mijfans(ミジュファンズ)`
      : 'mijfans（ミジュファンズ）は他のSNSでは見られない特別なエロコンテンツが多数。プライベート感のある動画や写真を安全に楽しめるファンクラブSNSです。';

    return {
      title: title,
      description: description,
      image: ogpData.ogp_image_url || 'https://logo.mijfans.jp/bimi/ogp-image.png',
      url: `${config.SITE_BASE_URL}/post?post_id=${postId}`,
      type: 'article',
    };
  } catch (error) {
    console.error('投稿OGPデータ取得エラー:', error);
    return null;
  }
}

/**
 * プロフィールページのOGPデータを取得
 */
async function fetchProfileOGPData(username, config) {
  try {
    // まずusernameからuser_idを取得
    const profileResponse = await fetch(`${config.API_BASE_URL}/users/profile?username=${username}`);
    if (!profileResponse.ok) {
      throw new Error(`プロフィール取得失敗: ${profileResponse.status}`);
    }
    const profileData = await profileResponse.json();

    // ユーザーOGP情報を取得（1回のAPI呼び出しで全情報を取得）
    const ogpResponse = await fetch(`${config.API_BASE_URL}/users/${profileData.id}/ogp-image`);
    if (!ogpResponse.ok) {
      throw new Error(`ユーザーOGP情報取得失敗: ${ogpResponse.status}`);
    }
    const ogpData = await ogpResponse.json();

    // プロフィール名を取得
    const displayName = ogpData.profile_name || username;

    return {
      title: `${displayName}さんのプロフィール | mijfans(ミジュファンズ)`,
      description: ogpData.bio || 'mijfans（ミジュファンズ）は他のSNSでは見られない特別なエロコンテンツが多数。プライベート感のある動画や写真を安全に楽しめるファンクラブSNSです。',
      image: ogpData.ogp_image_url || 'https://logo.mijfans.jp/bimi/ogp-image.png',
      url: `${config.SITE_BASE_URL}/profile?username=${username}`,
      type: 'profile',
    };
  } catch (error) {
    console.error('プロフィールOGPデータ取得エラー:', error);
    return null;
  }
}

/**
 * 動的OGP HTMLを生成
 */
function generateOGPHTML(ogpData, originalUrl) {
  const { title, description, image, url, type } = ogpData;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(description)}">

  <!-- Open Graph (OGP) -->
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="mijfans">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${escapeHTML(url)}">
  <meta property="og:image" content="${escapeHTML(image)}">
  <meta property="og:image:secure_url" content="${escapeHTML(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1080">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:alt" content="${escapeHTML(title)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(title)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">
  <meta name="twitter:image" content="${escapeHTML(image)}">
  <meta name="twitter:site" content="@mijfan_official">

  <!-- ユーザーを実際のページにリダイレクト（SNSクローラーは無視） -->
  <meta http-equiv="refresh" content="0;url=${escapeHTML(originalUrl)}">

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #000;
      color: #fff;
    }
    .container {
      text-align: center;
    }
    a {
      color: #00a0ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Redirecting...</h1>
    <p>If you are not redirected automatically, <a href="${escapeHTML(originalUrl)}">click here</a>.</p>
  </div>
</body>
</html>`;
}

/**
 * HTMLエスケープ
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Lambda@Edge ハンドラー
 */
export const handler = async (event) => {
  const request = event.Records[0].cf.request;
  const config = event.Records[0].cf.config;
  const headers = request.headers;
  const uri = request.uri;
  const querystring = request.querystring;

  // CloudFront Distribution IDを取得して環境を判定
  const distributionId = config.distributionId;
  const envConfig = ENVIRONMENTS[distributionId] || DEFAULT_CONFIG;

  console.log('[OGP Handler] Distribution ID:', distributionId);
  console.log('[OGP Handler] Config:', envConfig);

  // User-Agentを取得
  const userAgent = headers['user-agent'] ? headers['user-agent'][0].value : '';

  // SNSクローラーでない場合は通常のリクエストを処理
  if (!isSNSCrawler(userAgent)) {
    return request;
  }

  console.log('[OGP Handler] SNSクローラー検知:', userAgent);
  console.log('[OGP Handler] URI:', uri);
  console.log('[OGP Handler] Querystring:', querystring);

  // クエリパラメータを解析
  const params = getQueryParams(querystring);

  let ogpData = null;
  const originalUrl = `${envConfig.SITE_BASE_URL}${uri}${querystring ? '?' + querystring : ''}`;

  // URIからpost_idを抽出（/account/post/{post_id} 形式）
  const accountPostMatch = uri.match(/^\/account\/post\/([a-f0-9-]+)$/);

  // 投稿詳細ページ（複数パターン対応）
  if ((uri === '/post/detail' || uri === '/post') && params.post_id) {
    // /post/detail?post_id=xxx または /post?post_id=xxx
    console.log('[OGP Handler] 投稿詳細ページ（クエリパラメータ） - post_id:', params.post_id);
    ogpData = await fetchPostOGPData(params.post_id, envConfig);
  }
  else if (accountPostMatch) {
    // /account/post/{post_id}
    const postId = accountPostMatch[1];
    console.log('[OGP Handler] 投稿詳細ページ（パスパラメータ） - post_id:', postId);
    ogpData = await fetchPostOGPData(postId, envConfig);
  }
  // プロフィールページ
  else if (uri === '/profile' && params.username) {
    console.log('[OGP Handler] プロフィールページ - username:', params.username);
    ogpData = await fetchProfileOGPData(params.username, envConfig);
  }

  // OGPデータが取得できた場合、動的HTMLを返す
  if (ogpData) {
    const html = generateOGPHTML(ogpData, originalUrl);

    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'content-type': [{
          key: 'Content-Type',
          value: 'text/html; charset=UTF-8'
        }],
        'cache-control': [{
          key: 'Cache-Control',
          value: 'public, max-age=3600'
        }],
      },
      body: html,
    };
  }

  // OGPデータが取得できなかった場合は通常のリクエストを処理
  console.log('[OGP Handler] OGPデータ取得失敗 - 通常リクエストを処理');
  return request;
};
