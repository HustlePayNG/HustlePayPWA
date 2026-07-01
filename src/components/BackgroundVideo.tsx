import React, { memo, useRef, useEffect } from 'react';

const BackgroundVideoComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let retryCount = 0;
    const maxRetries = 3;

    const playVideo = () => {
      video.play().catch(error => {
        console.log("Autoplay check:", error);
      });
    };

    const handleEnded = () => {
      // Programmatic loop fallback
      video.currentTime = 0;
      playVideo();
    };

    const handleError = () => {
      const err = video.error;
      console.error("Video error event triggered. Code:", err ? err.code : "unknown");
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying video playback (Attempt ${retryCount}/${maxRetries})...`);
        setTimeout(() => {
          if (video) {
            video.load();
            playVideo();
          }
        }, 1500);
      }
    };

    // Initial play attempt
    playVideo();

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError, true);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden -z-20 bg-zinc-50">
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        preload="auto"
        className="w-full h-full object-cover"
      >
        <source src="/assets/images/13106016_2160_3840_60fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]"></div>
    </div>
  );
};

export const BackgroundVideo = memo(BackgroundVideoComponent);
export default BackgroundVideo;
