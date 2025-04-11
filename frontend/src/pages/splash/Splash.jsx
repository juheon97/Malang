import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

import gradientAnimation from './gradient-animation.json';

// Splash 화면 컴포넌트
const SplashScreen = ({ onComplete }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // 애니메이션이 완료된 후 필요한 작업 수행
    if (animationComplete && onComplete) {
      onComplete();
    }
  }, [animationComplete, onComplete]);

  return (
    <div className="splash-container">
      <Lottie
        animationData={gradientAnimation}
        loop={false} // 애니메이션을 한 번만 재생
        autoplay={true}
        style={{ width: '100%', height: '100vh' }} // 화면 전체 크기로 설정
        onComplete={() => setAnimationComplete(true)}
      />
    </div>
  );
};
