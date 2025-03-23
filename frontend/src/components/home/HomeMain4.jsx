// src/components/home/HomeMain4.jsx
import React from 'react';
import styles from '../../styles/home/Home4.module.css';
import homeStyles from '../../styles/home/Home.module.css';

const HomeMain4 = () => {
  return (
    <>
      <div className={`${homeStyles.featureImage} ${homeStyles.slideFromLeft}`}>
        {/* 이미지가 있다면 여기에 추가 */}
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
