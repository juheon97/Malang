// src/components/home/HomeMain2.jsx
import React from 'react';
import '../../styles/home/Home2.css';
import MainPhone from '../../assets/image/homemain2/Main2_phone.png';
import MainGreenCircle1 from '../../assets/image/homemain2/Main2_green_circle1.svg';
import MainGreenCircle2 from '../../assets/image/homemain2/Main2_green_circle2.svg';
import MainYellowCircle1 from '../../assets/image/homemain2/Main2_yellow_circle1.svg';
import MainDot1 from '../../assets/image/homemain2/Main2_dot1.svg';
import MainDot2 from '../../assets/image/homemain2/Main2_dot2.svg';

const HomeMain2 = () => {
  return (
    <>
      {/* 기존 녹색 원 이미지 - 약간 왼쪽으로 이동 */}
      <img
        src={MainGreenCircle1}
        alt="녹색 원2"
        className="circle-fade-in"
        style={{
          position: 'absolute',
          top: '15%',
          right: '0%',
          width: '500px',
          height: '500px',
          pointerEvents: 'none',
          objectFit: 'contain',
          maxWidth: 'none',
          zIndex: '0',
          opacity: '0',
          transform: 'translateY(-50%)',
          animationDelay: '0.5s',
        }}
      />

      {/* 녹색 원 이미지 추가 - 11시 방향 */}
      <img
        src={MainGreenCircle2}
        alt="녹색 원 11시"
        className="circle-fade-in"
        style={{
          position: 'absolute',
          top: '5%',
          left: '0%',
          width: '400px',
          height: '400px',
          pointerEvents: 'none',
          objectFit: 'contain',
          maxWidth: 'none',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.6s',
        }}
      />

      {/* 녹색 원 이미지 추가 - 5시 방향 */}
      <img
        src={MainGreenCircle2}
        alt="녹색 원 5시"
        className="circle-fade-in"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '20%',
          width: '400px',
          height: '400px',
          pointerEvents: 'none',
          objectFit: 'contain',
          maxWidth: 'none',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.7s',
        }}
      />

      {/* 노란색 원 이미지 추가 - 3시 방향 */}
      <img
        src={MainYellowCircle1}
        alt="노란색 원 3시"
        className="circle-fade-in"
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '400px',
          height: '400px',
          pointerEvents: 'none',
          objectFit: 'contain',
          maxWidth: 'none',
          zIndex: '0',
          opacity: '0',
          animationDelay: '0.8s',
        }}
      />

      {/* 점 이미지 추가 */}
      <img
        src={MainDot1}
        alt="점 이미지1"
        className="dot-slide-in"
        style={{
          position: 'absolute',
          top: '28%',
          left: '3%',
          width: '24px',
          height: '24px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '1s',
        }}
      />

      <img
        src={MainDot2}
        alt="점 이미지2"
        className="dot-slide-in"
        style={{
          position: 'absolute',
          top: '70%',
          left: '-5%',
          width: '25px',
          height: '25px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '0',
          opacity: '0',
          animationDelay: '1.2s',
        }}
      />

      <div
        className="feature-image slide-from-left"
        style={{ position: 'relative', zIndex: '2' }}
      >
        <img
          src={MainPhone}
          alt="음성 번역 앱"
          className="phone-img"
          style={{ pointerEvents: 'none', position: 'relative', zIndex: '2' }}
        />
      </div>

      <div
        className="feature-content right-align slide-from-right"
        style={{ position: 'relative', zIndex: '2' }}
      >
        <h3 className="feature-title">
          <span className="normal-text">원활한 소통을 위한</span>
          <span className="highlight">음성 번역</span>
        </h3>
      </div>
    </>
  );
};

export default HomeMain2;
