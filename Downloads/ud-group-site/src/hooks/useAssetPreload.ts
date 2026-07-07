import { useEffect, useState } from "react";

/**
 * Preloads a list of asset URLs and reports real 0-100 progress, so the
 * Preloader percentage means something instead of `Math.random()`
 * increments that can finish before the hero video is actually ready.
 *
 * Images resolve on load/error. Videos resolve as soon as they have enough
 * buffered data to start (`canplaythrough`), same bar the hero itself uses
 * via useProgressiveVideo, so the loader and the hero agree on "ready."
 */
export function useAssetPreload(urls: string[]) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(urls.length === 0);

  useEffect(() => {
    if (urls.length === 0) {
      setProgress(100);
      setDone(true);
      return;
    }

    let loaded = 0;
    let cancelled = false;

    const tick = () => {
      loaded += 1;
      if (cancelled) return;
      const pct = Math.round((loaded / urls.length) * 100);
      setProgress(pct);
      if (loaded >= urls.length) setDone(true);
    };

    const cleanups: Array<() => void> = [];

    urls.forEach((url) => {
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);

      if (isVideo) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        video.src = url;
        const onReady = () => tick();
        video.addEventListener("canplaythrough", onReady, { once: true });
        video.addEventListener("error", onReady, { once: true });
        // Some browsers need an explicit load() call to start buffering.
        video.load();
        cleanups.push(() => {
          video.removeEventListener("canplaythrough", onReady);
          video.removeEventListener("error", onReady);
        });
      } else {
        const img = new Image();
        img.onload = tick;
        img.onerror = tick;
        img.src = url;
      }
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [urls]);

  return { progress, done };
}
