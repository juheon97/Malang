// src/components/home/HomeMain4.jsx
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from '../../styles/home/Home4.module.css';
import homeStyles from '../../styles/home/Home.module.css';

const HomeMain4 = () => {
  return (
    <>
      <div 
        className={`${homeStyles.featureImage} ${homeStyles.slideFromLeft}`}
        style={{ 
          position: 'relative', 
          zIndex: '2',
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {/* Lottie 애니메이션 추가 */}
        <div className={styles.lottieContainer}>
          <DotLottieReact
            src="https://lottie.host/633e2c0d-8cba-4938-95fd-24873363b45c/QCv28hkHLZ.lottie"
            loop
            autoplay
            style={{
              width: '600px',
              height: 'auto',
              minHeight: '400px',
              borderRadius: '16px'
            }}
          />
        </div>
      </div>
      <div
        className={`${homeStyles.featureContent} ${homeStyles.rightAlign} ${homeStyles.slideFromRight}`}
      >
        <h3 className={homeStyles.featureTitle}>
          <span className={homeStyles.normalText}>상담을 위한</span>
          <span className={homeStyles.highlight}>상담 전용 채널</span>
        </h3>
      </div>
    </>
  );
};

export default HomeMain4;