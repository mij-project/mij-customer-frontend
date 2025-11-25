/**
 * 一時動画アップロード・サンプル動画切り取りAPI
 *
 * 並列アップロード対応版
 * - パートサイズ: 100MB（大容量ファイル最適化）
 * - 並列数: 6（ブラウザのHTTP/2接続を活用）
 * - 一括Presigned URL取得で API呼び出し削減
 */
import apiClient from '@/api/axios';
import { putToPresignedUrlWithRetry } from '@/service/s3FileUpload';
import {
  TempVideoMultipartInitResponse,
  TempVideoPartPresignResponse,
  CompletedPart,
  TempVideoMultipartCompleteRequest,
  PlaybackUrlResponse,
  CreateSampleRequest,
  SampleVideoResponse,
  BulkPartPresignRequest,
  BulkPartPresignResponse,
  PartPresignUrl,
} from '@/api/types/videoTmes';

// アップロード設定
// const PART_SIZE = 100 * 1024 * 1024; // 100MB（大容量ファイル最適化）
const PART_SIZE = 16 * 1024 * 1024; // 100MB（大容量ファイル最適化）
const CONCURRENT_UPLOADS = 10; // 同時アップロード数

/**
 * 本編動画を一時ストレージ（S3）にマルチパートアップロード（並列版）
 *
 * 最適化ポイント:
 * 1. パートサイズ100MB（20GB = 200パート）
 * 2. 6並列アップロードで高速化
 * 3. 一括Presigned URL取得でAPI呼び出し削減
 */
export const uploadTempMainVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ s3_key: string }> => {
  // 1. マルチパートアップロード初期化
  const initForm = new FormData();
  initForm.append('filename', file.name);
  initForm.append('content_type', file.type || 'video/mp4');

  const initRes = await apiClient.post<TempVideoMultipartInitResponse>(
    '/video-temp/temp-upload/main-video',
    initForm,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const { s3_key, upload_id } = initRes.data;

  // パート情報を計算
  const totalParts = Math.ceil(file.size / PART_SIZE);
  const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1);

  // 2. 全パートのPresigned URLを一括取得
  const bulkPresignRequest: BulkPartPresignRequest = {
    s3_key,
    upload_id,
    part_numbers: partNumbers,
  };

  const bulkPresignRes = await apiClient.post<BulkPartPresignResponse>(
    '/video-temp/temp-upload/bulk-part-presign',
    bulkPresignRequest
  );

  const presignedUrls = bulkPresignRes.data.urls;

  // 進捗管理用
  const partProgress = new Map<number, number>();
  partNumbers.forEach((n) => partProgress.set(n, 0));

  const updateTotalProgress = () => {
    if (!onProgress) return;
    let totalUploaded = 0;
    partProgress.forEach((progress, partNumber) => {
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(file.size, start + PART_SIZE);
      const partSize = end - start;
      totalUploaded += (progress / 100) * partSize;
    });
    const totalPct = Math.round((totalUploaded / file.size) * 100);
    onProgress(Math.min(99, totalPct)); // 完了前は99%まで
  };

  // 3. 並列アップロード
  const completedParts: CompletedPart[] = [];

  // パートをバッチに分けて並列処理
  for (let i = 0; i < totalParts; i += CONCURRENT_UPLOADS) {
    const batchPartNumbers = partNumbers.slice(i, i + CONCURRENT_UPLOADS);

    const batchResults = await Promise.all(
      batchPartNumbers.map(async (partNumber) => {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(file.size, start + PART_SIZE);
        const chunk = file.slice(start, end);

        const urlInfo = presignedUrls.find((u) => u.part_number === partNumber);
        if (!urlInfo) {
          throw new Error(`Part ${partNumber} のPresigned URLが見つかりません`);
        }

        const etag = await uploadPartToPresignedUrl(urlInfo.upload_url, chunk, {
          maxRetries: 3,
          onProgress: (pct) => {
            partProgress.set(partNumber, pct);
            updateTotalProgress();
          },
        });

        return {
          part_number: partNumber,
          etag,
        };
      })
    );

    completedParts.push(...batchResults);
  }

  // 100%に揃える
  if (onProgress) {
    onProgress(100);
  }

  // 4. 完了APIを叩いてマルチパートアップロードを確定
  const completePayload: TempVideoMultipartCompleteRequest = {
    s3_key,
    upload_id,
    parts: completedParts,
  };

  await apiClient.post('/video-temp/temp-upload/main-video/complete', completePayload);

  return { s3_key };
};

/**
 * 旧API互換用（逐次アップロード版）
 * 必要に応じて使用可能
 */
export const uploadTempMainVideoSequential = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ s3_key: string }> => {
  const initForm = new FormData();
  initForm.append('filename', file.name);
  initForm.append('content_type', file.type || 'video/mp4');

  const initRes = await apiClient.post<TempVideoMultipartInitResponse>(
    '/video-temp/temp-upload/main-video',
    initForm,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const { s3_key, upload_id } = initRes.data;
  const SEQUENTIAL_PART_SIZE = 50 * 1024 * 1024; // 50MB
  const totalParts = Math.ceil(file.size / SEQUENTIAL_PART_SIZE);

  const completedParts: CompletedPart[] = [];
  let uploadedBytesBase = 0;

  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    const start = (partNumber - 1) * SEQUENTIAL_PART_SIZE;
    const end = Math.min(file.size, start + SEQUENTIAL_PART_SIZE);
    const chunk = file.slice(start, end);

    const partForm = new FormData();
    partForm.append('s3_key', s3_key);
    partForm.append('upload_id', upload_id);
    partForm.append('part_number', String(partNumber));

    const partRes = await apiClient.post<TempVideoPartPresignResponse>(
      '/video-temp/temp-upload/main-video/part-presign',
      partForm,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const { upload_url } = partRes.data;
    const partSize = end - start;

    const etag = await uploadPartToPresignedUrl(upload_url, chunk, {
      maxRetries: 3,
      onProgress: (pct) => {
        if (!onProgress) return;
        const uploadedInPart = (pct / 100) * partSize;
        const totalUploaded = uploadedBytesBase + uploadedInPart;
        const totalPct = Math.round((totalUploaded / file.size) * 100);
        onProgress(Math.min(100, totalPct));
      },
    });

    completedParts.push({
      part_number: partNumber,
      etag,
    });

    uploadedBytesBase += partSize;
  }

  if (onProgress) {
    onProgress(100);
  }

  const completePayload: TempVideoMultipartCompleteRequest = {
    s3_key,
    upload_id,
    parts: completedParts,
  };

  await apiClient.post('/video-temp/temp-upload/main-video/complete', completePayload);

  return { s3_key };
};

/**
 * 単一パートを presigned URL に PUT し、ETag を返す
 */
async function uploadPartToPresignedUrl(
  uploadUrl: string,
  chunk: Blob,
  opts?: { onProgress?: (pct: number) => void; maxRetries?: number }
): Promise<string> {
  const maxRetries = opts?.maxRetries ?? 3;
  const client = apiClient.create({ withCredentials: false, timeout: 600_000 }); // 10分くらい余裕を持たせる

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.put(uploadUrl, chunk, {
        onUploadProgress: (e) => {
          if (opts?.onProgress && e.total) {
            opts.onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
        validateStatus: () => true,
      });


      if (response.status < 200 || response.status >= 300) {
        const body =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        console.error('[S3 Part Upload] Error response:', body);
        throw new Error(`S3 part PUT failed ${response.status}: ${body?.slice(0, 500)}`);
      }

      const etag = response.headers['etag'] as string | undefined;
      if (!etag) {
        throw new Error('ETag がレスポンスヘッダに含まれていません');
      }

      return etag;
    } catch (error) {
      console.error(`[S3 Part Upload] アップロード試行 ${attempt}/${maxRetries} 失敗:`, error);

      if (attempt === maxRetries) {
        throw new Error(`${maxRetries}回のリトライ後にパートアップロードに失敗しました: ${error}`);
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // ここには基本来ない
  throw new Error('予期せぬエラー: パートアップロードが完了しませんでした');
}

/**
 * 一時動画の再生用URLを取得
 */
export const getTempVideoPlaybackUrl = async (s3Key: string): Promise<PlaybackUrlResponse> => {
  const response = await apiClient.get<PlaybackUrlResponse>(
    `/video-temp/playback-url/${encodeURIComponent(s3Key)}`
  );
  return response.data;
};
