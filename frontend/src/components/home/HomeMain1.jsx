// src/components/home/HomeMain1.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home/Home1.css';
// 폰트 CSS 파일 import
import '../../styles/fonts.css';
// SVG 로고 import
import MallangLogo from '../../assets/image/Mallang_logo.svg';
// 메인 대화 이미지 import
import MainDialogue from '../../assets/image/mainpage/Main_dialogue.png';
// 원형 이미지 import
import MainGreenCircle from '../../assets/image/mainpage/Main_green_circle.png';
import MainYellowCircle from '../../assets/image/mainpage/Main_yellow_circle.png';
import MainGreenCircle3 from '../../assets/image/mainpage/Main_green_circle3.png';
// 점 이미지 import
import MainDot1 from '../../assets/image/mainpage/Main_dot1.png';
import MainDot2 from '../../assets/image/mainpage/Main_dot2.png';

const HomeMain1 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="hero-section"
      style={{
        paddingTop: '80px',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* 원형 이미지 추가 - navbar와 겹치지 않도록 위치 조정 */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          zIndex: '0',
        }}
      >
        <img
          src={MainGreenCircle}
          alt="녹색 원"
          className="shape-animation green-circle"
          style={{
            position: 'absolute',
            top: '0px',
            left: '-80px',
            width: '350px',
            height: '350px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
          }}
        />
        <img
          src={MainYellowCircle}
          alt="노란색 원"
          className="shape-animation yellow-circle"
          style={{
            position: 'absolute',
            top: '-50px',
            left: '70px',
            width: '300px',
            height: '300px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
          }}
        />
        {/* 점 이미지 추가 - 녹색 원 우측에서 약간 우상단으로 이동 */}
        <img
          src={MainDot1}
          alt="점 이미지"
          className="shape-animation dot-animation"
          style={{
            position: 'absolute',
            top: '110px',
            left: '360px',
            width: '40px',
            height: '40px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
            zIndex: '0',
          }}
        />
        {/* 점 이미지2 추가 - '누구든' 텍스트의 왼쪽에 배치 - 왼쪽 아래로 더 이동 */}
        <img
          src={MainDot2}
          alt="점 이미지2"
          className="shape-animation dot-animation-delayed"
          style={{
            position: 'absolute',
            top: '350px',
            left: '-120px',
            width: '20px',
            height: '20px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
            zIndex: '5',
          }}
        />
      </div>
      <div className="hero-content">
        <div className="logo-area">
          <img src={MallangLogo} alt="말랑 로고" className="hero-logo" />
          <h1 className="hero-title">말랑</h1>
        </div>
        <h2 className="hero-subtitle" style={{ marginBottom: '-10px' }}>
          Mallang
        </h2>
        <p className="hero-desc">누구든 쉽게 소통할 수 있는</p>
        <p className="hero-features">
          음성 입력 / 음성 번역 / 음성 출력 / 음성 STT
          <br />
          음성 인식 / 실시간 대화 / 실시간 자막 / STT TTS 번역으로
          <br />
          점자 기기 / 보조기 호환 음성 / 필담으로 간단하게 소통 가능
        </p>
        <div className="hero-buttons">
          <button
            className="home-signup-btn"
            onClick={() => navigate('/Signup')}
          >
            회원가입
          </button>
          <button className="login-btn" onClick={() => navigate('/login')}>
            로그인
          </button>
        </div>
      </div>
      {/* 녹색 원 이미지를 hero-section에 절대 위치로 배치 및 애니메이션 추가 */}
      <img
        src={MainGreenCircle3}
        alt="녹색 원3"
        className="shape-animation green-circle-large"
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          top: '-30px',
          right: '-140px',
          pointerEvents: 'none',
          zIndex: '1' /* DialogImage보다 낮고 배경보다 높은 z-index */,
          opacity: 0 /* 처음에는 투명하게 설정하고 애니메이션으로 표시 */,
        }}
      />

      <div className="hero-image">
        <div style={{ position: 'relative' }}>
          {/* 대화 이미지 */}
          <img
            src={MainDialogue}
            alt="대화 이미지"
            className="main-dialogue-img"
            style={{
              pointerEvents: 'none',
              position: 'relative',
              zIndex: '2',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeMain1;
