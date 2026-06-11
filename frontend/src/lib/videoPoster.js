// Generates a poster image (JPEG blob) from a video URL by drawing the first non-zero frame to a canvas.
// Used to speed up thumbnails and previews without needing server-side ffmpeg.
export function generateVideoPoster(videoUrl, opts = {}) {
  const seekTo = opts.seekTo ?? 0.5; // grab a frame at ~0.5s for stability
  const quality = opts.quality ?? 0.82;
  const maxWidth = opts.maxWidth ?? 720;

  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    // Don't set crossOrigin for same-origin videos — it forces a stricter CORS check
    // that can cause canvas tainting even on identical origins in some browsers.
    v.preload = "auto";
    v.muted = true;
    v.playsInline = true;
    v.src = videoUrl;

    let done = false;
    const finish = (blob) => {
      if (done) return;
      done = true;
      v.remove();
      resolve(blob);
    };
    const fail = (err) => {
      if (done) return;
      done = true;
      v.remove();
      reject(err);
    };

    v.addEventListener("loadedmetadata", () => {
      // Seek to a small time to capture a real frame.
      try {
        v.currentTime = Math.min(seekTo, Math.max(0, (v.duration || 1) - 0.05));
      } catch (e) { fail(e); }
    });
    v.addEventListener("seeked", () => {
      try {
        const ratio = v.videoHeight / v.videoWidth;
        const w = Math.min(maxWidth, v.videoWidth || maxWidth);
        const h = Math.round(w * (ratio || 1.33));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(v, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (!blob) return fail(new Error("toBlob failed"));
          finish(blob);
        }, "image/jpeg", quality);
      } catch (e) { fail(e); }
    });
    v.addEventListener("error", () => fail(new Error("video load error")));
    setTimeout(() => fail(new Error("timeout")), 12000);
  });
}
