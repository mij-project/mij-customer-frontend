import { useEffect, useRef } from 'react';
import { gaEvent } from '@/lib/ga';

function toVideoKind(kind: number): 'メイン動画' | 'サンプル動画' | '画像' | 'その他' {
  if (kind === 3) return '画像';
  if (kind === 4) return 'メイン動画';
  if (kind === 5) return 'サンプル動画';
  return 'その他';
}

function purchasedPost(is_purchased: boolean): '購入済み' | '未購入' | '未購入' {
  if (is_purchased) return '購入済み';
  if (!is_purchased) return '未購入';
  return '未購入';
}

function toOrientation(orientation: number): '縦' | '横' | 'その他' {
  if (orientation === 1) return '縦';
  if (orientation === 2) return '横';
  return 'その他';
}

type MediaInfo = {
  kind: number; // 3: images, 4: main, 5: sample
  duration?: number;
  media_assets_id?: string;
  orientation?: number;
};

type PostLike = {
  id: string;
  description?: string;
  is_purchased: boolean;
  post_main_duration?: number;
  creator?: { user_id?: string };
  sale_info?: { price?: { price?: number } };
};

export function useLoopVideoAnalytics({
  videoRef,
  post,
  media,
  autoplay = true,
  completeThreshold = 0.95,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  post: PostLike | null | undefined;
  media: MediaInfo | null | undefined;
  autoplay?: boolean;
  completeThreshold?: number;
}) {
  const started = useRef(false);
  const completed = useRef(false);
  const progressSent = useRef({ 25: false, 50: false, 75: false });

  // メディアが切り替わったら送信状態をリセット
  useEffect(() => {
    started.current = false;
    completed.current = false;
    progressSent.current = { 25: false, 50: false, 75: false };
  }, [media?.media_assets_id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !post?.id || !media) return;

    const postId = post.id;
    const creatorId = post.creator?.user_id;
    const price = post.sale_info?.price?.price ?? 0;

    const purchasedPostStatus = purchasedPost(post.is_purchased);

    const orientation = toOrientation(media.orientation);

    const videoKind = toVideoKind(media.kind);
    if (videoKind === 'その他') return;

    const durationSec =
      Math.round(
        media.duration ??
          post.post_main_duration ??
          (Number.isFinite(video.duration) ? video.duration : 0)
      ) || undefined;

    const sendStart = () => {
      if (started.current) return;
      started.current = true;

      gaEvent('video_start', {
        post_id: postId,
        description: post.description,
        creator_id: creatorId,
        video_kind: videoKind, // "main" | "sample"
        media_kind: media.kind, // 3 | 4 | 5
        media_assets_id: media.media_assets_id,
        autoplay,
        duration_sec: durationSec,
        orientation: orientation,
        price,
        is_purchased: purchasedPostStatus,
      });
    };

    const sendProgress = (p: 25 | 50 | 75) => {
      if (progressSent.current[p]) return;
      progressSent.current[p] = true;

      gaEvent('video_progress', {
        post_id: postId,
        description: post.description,
        creator_id: creatorId,
        video_kind: videoKind,
        media_kind: media.kind,
        media_assets_id: media.media_assets_id,
        autoplay,
        progress: p,
        current_time_sec: Math.floor(video.currentTime),
        duration_sec: durationSec,
      });
    };

    const sendComplete = () => {
      if (completed.current) return;
      completed.current = true;

      if (!started.current) sendStart();

      gaEvent('video_complete', {
        post_id: postId,
        description: post.description,
        creator_id: creatorId,
        video_kind: videoKind,
        media_kind: media.kind,
        media_assets_id: media.media_assets_id,
        autoplay,
        current_time_sec: Math.floor(video.currentTime),
        duration_sec: durationSec,
        complete_threshold: completeThreshold,
      });
    };

    const onPlay = () => sendStart();

    const onTimeUpdate = () => {
      const d = Number.isFinite(video.duration) ? video.duration : (media.duration ?? 0);
      if (!d || d <= 0) return;

      const ratio = video.currentTime / d;

      if (!started.current && video.currentTime > 0.1) sendStart();

      if (ratio >= 0.25) sendProgress(25);
      if (ratio >= 0.5) sendProgress(50);
      if (ratio >= 0.75) sendProgress(75);

      // ループでも「95%到達」で完走扱い
      if (ratio >= completeThreshold) sendComplete();
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [videoRef, post?.id, media?.media_assets_id, autoplay, completeThreshold]);
}
