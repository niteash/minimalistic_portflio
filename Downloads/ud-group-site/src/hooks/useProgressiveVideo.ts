import { useEffect, useRef, useState } from "react";

/**
 * Wraps a <video> ref and reports when it has enough buffered data to play
 * smoothly. `autoplay` controls whether we kick off playback as soon as
 * we're ready (the hero wants this; a lazily-mounted section might not).
 */
export function useProgressiveVideo(autoplay: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      setIsReady(true);
      if (autoplay) {
        video.play().catch(() => {
          // Autoplay can be blocked (e.g. low power mode) — muted video
          // failing silently here is fine, it'll start on first interaction.
        });
      }
    };

    if (video.readyState >= 3) {
      markReady();
    } else {
      video.addEventListener("canplaythrough", markReady, { once: true });
      video.addEventListener("loadeddata", markReady, { once: true });
    }

    return () => {
      video.removeEventListener("canplaythrough", markReady);
      video.removeEventListener("loadeddata", markReady);
    };
  }, [autoplay]);

  return { videoRef, isReady };
}
