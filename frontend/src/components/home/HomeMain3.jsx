// src/components/home/HomeMain3.jsx
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from '../../styles/home/Home3.module.css';
import homeStyles from '../../styles/home/Home.module.css';
import home2Styles from '../../styles/home/Home2.module.css';
import MainDot1 from '../../assets/image/homemain3/Main3_dot1.svg';
import MainDot2 from '../../assets/image/homemain3/Main3_dot2.svg';
import MainGreenCircle1 from '../../assets/image/homemain3/Main3_green_circle1.svg';
import MainYellowCircle1 from '../../assets/image/homemain3/Main3_yellow_circle1.svg';
import MainGreenHalf from '../../assets/image/homemain3/Main3_green_half.svg';

const HomeMain3 = () => {
  return (
    <>
      <img
        src={MainGreenCircle1}
        alt="녹색 원"
        className={home2Styles.circleFadeIn}
        style={{
          position: 'absolute',
          top: '30%',
          left: '-1%',
          width: '350px',
          height: '350px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.5s',
        }}
      />

      <img
        src={MainYellowCircle1}
        alt="노란색 원"
        className={home2Styles.circleFadeIn}
        style={{
          position: 'absolute',
          bottom: '35%',
          left: '-10%',
          width: '350px',
          height: '350px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.8s',
        }}
      />

      <img
        src={MainDot1}
        alt="점 이미지1"
        className={home2Styles.dotSlideIn}
        style={{
          position: 'absolute',
          top: '32%',
          left: '-1%',
          width: '15px',
          height: '15px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.5s',
        }}
      />

      <img
        src={MainDot1}
        alt="점 이미지2"
        className={home2Styles.dotSlideIn}
        style={{
          position: 'absolute',
          top: '70%',
          left: '31%',
          width: '25px',
          height: '25px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.8s',
          transform: 'translateX(30px)',
        }}
      />

      <img
        src={MainDot2}
        alt="점 이미지3"
        className={home2Styles.dotSlideIn}
        style={{
          position: 'absolute',
          top: '46.7%',
          left: '6%',
          width: '20px',
          height: '20px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '1s',
        }}
      />

      <img
        src={MainGreenHalf}
        alt="녹색 반원"
        className={home2Styles.circleFadeIn}
        style={{
          position: 'absolute',
          bottom: '-35%',
          right: '-40%',
          width: '600px',
          height: '600px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.8s',
        }}
      />

      <div
        className={`${homeStyles.featureContent} ${homeStyles.leftAlign} ${homeStyles.slideFromLeft}`}
        style={{ position: 'relative', zIndex: '2' }}
      >
        <h3 className={homeStyles.featureTitle}>
          <div className={styles.inlineTitle}>
            <span className={homeStyles.highlight}>수어 인식</span>&nbsp;
            <span className={homeStyles.normalText}>후 자막 생성</span>
          </div>
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
        {/* Lottie 애니메이션 추가 - 크기 키움 */}
        <div className={styles.lottieContainer} style={{ width: '90%', maxWidth: '600px' }}>
          <DotLottieReact
            src="https://lottie.host/8c30fc71-4697-43eb-b5aa-91edf55b2cbb/ogvT3ut3Mm.lottie"
            loop
            autoplay
            style={{
              width: '1000px',
              height: 'auto',
              minHeight: '400px', // 최소 높이 설'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default HomeMain3;