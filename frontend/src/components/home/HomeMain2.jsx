// src/components/home/HomeMain2.jsx
import React from 'react';
import '../../styles/home/Home2.css';
// 이미지 import
import MainPhone from '../../assets/image/mainpage/Main_phone.png';
import MainGreenCircle from '../../assets/image/mainpage/Main_green_circle.png';
import MainGreenCircle2 from '../../assets/image/mainpage/Main_green_circle2.png';
import MainYellowCircle from '../../assets/image/mainpage/Main_yellow_circle.png';
import MainDot3 from '../../assets/image/mainpage/Main_dot3.png';
import MainDot4 from '../../assets/image/mainpage/Main_dot4.png';

const HomeMain2 = () => {
  return (
    <>
      {/* 녹색 원 이미지 추가 - 애니메이션 없이 */}
      <img
        src={MainGreenCircle2}
        alt="녹색 원2"
        style={{
          position: 'absolute',
          top: '50%',
          right: '0%',
          width: '500px',
          height: '500px',
          pointerEvents: 'none',
          objectFit: 'contain',
          maxWidth: 'none',
          zIndex: '0',
          opacity: '0.6',
          transform: 'translateY(-50%)',
        }}
      />

      {/* 점 이미지 3과 4를 feature-image 외부로 이동하여 애니메이션 영향을 받지 않도록 함 */}
      <img
        src={MainDot3}
        alt="점 이미지3"
        style={{
          position: 'absolute',
          top: '28%',
          left: 'calc(50% - 550px)',
          width: '24px',
          height: '24px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '2',
          opacity: '1', // 항상 보이도록 opacity 값 설정
        }}
      />

      <img
        src={MainDot4}
        alt="점 이미지4"
        style={{
          position: 'absolute',
          top: '70%',
          left: 'calc(50% - 650px)',
          width: '25px',
          height: '25px',
          pointerEvents: 'none',
          objectFit: 'contain',
          zIndex: '2',
          opacity: '1', // 항상 보이도록 opacity 값 설정
        }}
      />

      <div
        className="feature-image slide-from-left"
        style={{ position: 'relative' }}
      >
        {/* 추가된 원형 이미지들 */}
        <img
          src={MainGreenCircle}
          alt="녹색 원 1"
          className="shape-animation green-circle-feature"
          style={{
            position: 'absolute',
            top: '-30px',
            left: '-100px',
            width: '320px',
            height: '320px',
            pointerEvents: 'none',
            objectFit: 'contain',
            zIndex: '0',
            opacity: '0.8',
          }}
        />

        <img
          src={MainGreenCircle}
          alt="녹색 원 2"
          className="shape-animation green-circle"
          style={{
            position: 'absolute',
            bottom: '-40px',
            right: '50px',
            width: '200px',
            height: '200px',
            pointerEvents: 'none',
            objectFit: 'contain',
            zIndex: '0',
            opacity: '0.6',
          }}
        />

        <img
          src={MainYellowCircle}
          alt="노란색 원"
          className="shape-animation yellow-circle"
          style={{
            position: 'absolute',
            top: '120px',
            right: '-70px',
            width: '320px',
            height: '320px',
            pointerEvents: 'none',
            objectFit: 'contain',
            zIndex: '0',
            opacity: '0.7',
          }}
        />

        <img
          src={MainPhone}
          alt="음성 번역 앱"
          className="phone-img"
          style={{ pointerEvents: 'none', position: 'relative', zIndex: '1' }} // 이미지 클릭 이벤트 무시, z-index 추가
        />
      </div>
      <div
        className="feature-content right-align slide-from-right"
        style={{ position: 'relative', zIndex: '1' }}
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
