import { PresignedUploadItem } from '@/api/types/s3';
import axios from 'axios';

/**
 * S3 の presigned URL に対して PUT するユーティリティ
 * - CSRF不要のため apiClient ではなく素の axios を使用
 * - onProgress は 0-100 の整数パーセンテージ
 */
export async function putToPresignedUrl(
  item: PresignedUploadItem,
  file: File,
  headers: Record<string, string>,
  opts?: { onProgress?: (pct: number) => void }
): Promise<void> {
  const client = axios.create({ withCredentials: false, timeout: 600_000 }); // 10分
  await client
    .put(item.upload_url, file, {
      headers: headers,
      onUploadProgress: (e) => {
        if (opts?.onProgress && e.total) opts.onProgress(Math.round((e.loaded * 100) / e.total));
      },
      validateStatus: () => true,
    })
    .then((res) => {
      if (res.status < 200 || res.status >= 300) {
        const body = typeof res.data === 'string' ? res.data : (res.request?.responseText ?? '');
        throw new Error(`S3 PUT failed ${res.status}: ${body?.slice(0, 500)}`);
      }
    });
}

/**
 * S3の署名付きURLに対してファイルをアップロード（リトライ機能付き、ヘッダー情報なしでも可）
 * - 最大3回リトライ
 * - onProgressは0-100の整数パーセンテージ
 */
export async function putToPresignedUrlWithRetry(
  uploadUrl: string,
  file: File,
  opts?: { onProgress?: (pct: number) => void; maxRetries?: number }
): Promise<void> {
  const maxRetries = opts?.maxRetries ?? 3;
  const client = axios.create({ withCredentials: false, timeout: 120_000 });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.put(uploadUrl, file, {
        onUploadProgress: (e) => {
          if (opts?.onProgress && e.total) {
            opts.onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        validateStatus: () => true,
      });

      console.log('[S3 Upload] Response status:', response.status);
      console.log('[S3 Upload] Response headers:', response.headers);

      if (response.status < 200 || response.status >= 300) {
        const body =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        console.error('[S3 Upload] Error response:', body);
        throw new Error(`S3 PUT failed ${response.status}: ${body?.slice(0, 500)}`);
      }

      // 成功したらループを抜ける
      console.log('[S3 Upload] アップロード成功');
      return;
    } catch (error) {
      console.error(`[S3 Upload] アップロード試行 ${attempt}/${maxRetries} 失敗:`, error);

      if (attempt === maxRetries) {
        // 最終試行で失敗した場合はエラーを投げる
        throw new Error(`${maxRetries}回のリトライ後にアップロードに失敗しました: ${error}`);
      }

      // リトライ前に少し待機（指数バックオフ）
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
