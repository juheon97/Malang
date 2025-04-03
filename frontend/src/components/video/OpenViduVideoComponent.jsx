import React, { useRef, useEffect } from 'react';

export default function OpenViduVideoComponent({ streamManager, isSelf }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      console.log('Setting up video element for stream:', streamManager);
      
      // 비디오 요소가 준비되었는지 확인
      const setupVideo = () => {
        try {
          // 기존 비디오 요소 제거 (정리)
          streamManager.removeAllVideos();
          
          // 비디오 요소 추가
          streamManager.addVideoElement(videoRef.current);
          console.log('Video element successfully added to', streamManager);
        } catch (error) {
          console.error('Error adding video element:', error);
        }
      };
      
      // DOM 요소가 준비될 시간을 주기 위해 작은 지연 추가
      const timeoutId = setTimeout(setupVideo, 100);
      
      return () => {
        clearTimeout(timeoutId);
        if (streamManager) {
          try {
            console.log('Cleaning up video element');
            streamManager.removeAllVideos();
          } catch (err) {
            console.log('Error during cleanup:', err);
          }
        }
      };
    }
  }, [streamManager]);

  return (
    <div className="video-container h-full w-full">
      <video
        autoPlay={true}
        playsInline={true}
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={isSelf} // 자신의 오디오는 뮤트 처리
      />
    </div>
  );
}