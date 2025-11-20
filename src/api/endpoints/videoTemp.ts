/**
 * 一時動画アップロード・サンプル動画切り取りAPI
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
} from '@/api/types/videoTmes';

/**
 * 本編動画を一時ストレージ（S3）にマルチパートアップロード
 * 1. バックエンドから upload_id / s3_key を取得（init）
 * 2. ファイルを分割して、各パートごとに presigned URL を取得 → PUT
 * 3. 完了APIを呼び出してオブジェクトを確定
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

  // 2. ファイルを分割してパートごとにアップロード
  // 例: 50MB ごとに分割（お好みで調整可）
  const PART_SIZE = 50 * 1024 * 1024;
  const totalParts = Math.ceil(file.size / PART_SIZE);

  const completedParts: CompletedPart[] = [];

  let uploadedBytesBase = 0;

  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    const start = (partNumber - 1) * PART_SIZE;
    const end = Math.min(file.size, start + PART_SIZE);
    const chunk = file.slice(start, end);

    // 2-1. このパート用の presigned URL を取得
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

    // 2-2. このパートを PUT
    const partSize = end - start;

    const etag = await uploadPartToPresignedUrl(upload_url, chunk, {
      maxRetries: 3,
      onProgress: (pct) => {
        if (!onProgress) return;

        // このパート内での進捗を全体の進捗にマッピング
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

  // 念のため100%に揃える
  if (onProgress) {
    onProgress(100);
  }

  // 3. 完了APIを叩いてマルチパートアップロードを確定
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
