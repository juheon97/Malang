// src/components/home/HomeMain5.jsx
import React from 'react';
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
      >
        {/* 이미지가 있다면 여기에 추가 */}
      </div>
    </>
  );
};

export default HomeMain5;
