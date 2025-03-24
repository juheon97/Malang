// UserVideoComponent.jsx
import React, { useRef, useEffect } from 'react';

export default function OpenViduVideoComponent({ streamManager, isSelf }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      // 안전하게 비디오 요소 연결
      streamManager.addVideoElement(videoRef.current);

      return () => {
        if (streamManager) {
          try {
            streamManager.removeVideoElement(videoRef.current);
          } catch (e) {}
        }
      };
    }
  }, [streamManager]);

  return (
    <video
      autoPlay
      playsInline
      ref={videoRef}
      className="w-full h-full object-cover"
      muted={isSelf}
    />
  );
}
