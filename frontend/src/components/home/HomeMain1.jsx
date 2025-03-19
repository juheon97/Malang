// src/components/home/HomeMain1.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/home/Home1.css';
// 폰트 CSS 파일 import
import '../../styles/fonts.css';
// SVG 로고 import
import MallangLogo from '../../assets/image/Mallang_logo.svg';
// 메인 대화 이미지 import
import MainDialogue from '../../assets/image/homemain1/Main1_dialogue.png';
// 원형 이미지 import
import MainGreenCircle1 from '../../assets/image/homemain1/Main1_green_circle1.svg';
import MainGreenCircle2 from '../../assets/image/homemain1/Main1_green_circle2.svg';
import MainYellowCircle from '../../assets/image/homemain1/Main1_yellow_circle.svg';
// 점 이미지 import
import MainDot1 from '../../assets/image/homemain1/Main1_dot1.svg';
import MainDot2 from '../../assets/image/homemain1/Main1_dot2.svg';

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
          src={MainGreenCircle1}
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
            zIndex: '0',
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
            zIndex: '0',
          }}
        />
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
            zIndex: '0',
          }}
        />
      </div>
      <div
        className="hero-content"
        style={{ position: 'relative', zIndex: '2' }}
      >
        <div className="logo-area">
          <img src={MallangLogo} alt="말랑 로고" className="hero-logo" />
          <h1 className="hero-title">말랑</h1>
        </div>
        <h2 className="hero-subtitle">Mallang</h2>
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
        src={MainGreenCircle2}
        alt="녹색 원3"
        className="shape-animation green-circle-large"
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          top: '-30px',
          right: '-140px',
          pointerEvents: 'none',
          zIndex: '0',
          opacity: 0,
        }}
      />

      <div className="hero-image" style={{ position: 'relative', zIndex: '2' }}>
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
  );
};

export default HomeMain1;
