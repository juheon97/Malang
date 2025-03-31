//src>components>video>OpenViduVideoComponent.jsx

import React, { useRef, useEffect } from 'react';

export default function OpenViduVideoComponent({ streamManager, isSelf }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      try {
        // 기존 비디오 요소 제거
        streamManager.removeAllVideos();

        // 새 비디오 요소 추가 (지연 추가)
        const timeout = setTimeout(() => {
          if (videoRef.current) {
            console.log('New video element associated to ', streamManager);
            streamManager.addVideoElement(videoRef.current);
          }
        }, 50);

        return () => {
          clearTimeout(timeout);
          if (streamManager) {
            try {
              streamManager.removeAllVideos();
            } catch (error) {
              console.error('비디오 요소 제거 오류:', error);
            }
          }
        };
      } catch (error) {
        console.error('비디오 요소 추가 오류:', error);
      }
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
