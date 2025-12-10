const getVideoMetadata = (file: File) => {
    return new Promise<{ width: number; height: number; duration: number }>((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.playsInline = true;
        video.muted = true;

        const url = URL.createObjectURL(file);

        const cleanup = () => {
            try {
                URL.revokeObjectURL(url);
                video.removeAttribute('src');
                video.load();
                video.remove();
            } catch { }
        };

        video.onloadedmetadata = () => {
            const width = video.videoWidth;
            const height = video.videoHeight;
            const duration = Number.isFinite(video.duration) ? video.duration : 0;
            cleanup();
            resolve({ width, height, duration });
        };

        video.onerror = () => {
            cleanup();
            reject(new Error('VIDEO_METADATA_READ_FAILED'));
        };

        video.src = url;
        video.load();
    });
};

const classifyResolution = (w: number, h: number) => {
    if (w >= 3840 || h >= 2160) return '4K';
    if (w >= 1920 || h >= 1080) return '1080p';
    if (w >= 1280 || h >= 720) return '720p';
    return 'SD';
};

export { getVideoMetadata, classifyResolution };