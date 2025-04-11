// src/components/home/HomeMain5.jsx
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from '../../styles/home/Home5.module.css';
import homeStyles from '../../styles/home/Home.module.css';

const HomeMain5 = () => {
  return (
    <>
      <div
        className={`${homeStyles.featureContent} ${homeStyles.leftAlign} ${homeStyles.slideFromLeft}`}
      >
        <h3 className={homeStyles.featureTitle}>
          <span className={homeStyles.normalText}>누구나 어려움 없이</span>
          <span className={homeStyles.highlight}>소통 채널 지원</span>
        </h3>
      </div>
      <div
        className={`${homeStyles.featureImage} ${homeStyles.slideFromRight}`}
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
            src="https://lottie.host/336a94ec-e867-42f9-b1d1-2fde9862d315/89ZCNmKMyx.lottie"
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
    </>
  );
};

export default HomeMain5;