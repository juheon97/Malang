// components/video/SignLanguageVideoComponent.jsx
import React, { useRef, useEffect, useState } from 'react';
import SignLanguageTranslator from '../hand_language/SignLanguageTranslator';

export default function SignLanguageVideoComponent({
  streamManager,
  isSelf,
  onTranslationResult,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      // 기존 비디오 요소 제거
      streamManager.removeAllVideos();

      // 새 비디오 요소 추가
      const timeout = setTimeout(() => {
        if (videoRef.current) {
          streamManager.addVideoElement(videoRef.current);
        }
      }, 50);

      return () => {
        clearTimeout(timeout);
        if (streamManager) {
          streamManager.removeAllVideos();
        }
      };
    }
  }, [streamManager]);

  return (
    <div className="relative w-full h-full">
      {/* 숨겨진 비디오 요소 - OpenVidu 스트림 연결용 */}
      <video
        autoPlay
        playsInline
        ref={videoRef}
        className="absolute opacity-0"
        muted={isSelf}
        style={{ width: '100%', height: '100%' }}
      />

      {/* SignLanguageTranslator 컴포넌트 */}
      <SignLanguageTranslator
        videoRef={videoRef}
        onTranslationResult={onTranslationResult}
      />
    </div>
  );
}
