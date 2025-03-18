// src/components/home/HomeMain.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
// 폰트 CSS 파일 import
import "../../styles/fonts.css";
// SVG 로고 import
import MallangLogo from "../../assets/image/Mallang_logo.svg";
// 메인 대화 이미지 import
import MainDialogue from "../../assets/image/Main_dialogue.png";
import MainPhone from "../../assets/image/Main_phone.png";

function HomeMain() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-area">
            <img src={MallangLogo} alt="말랑 로고" className="hero-logo" />
            <h1 className="hero-title">말랑</h1>
          </div>
          <h2 className="hero-subtitle">Mallang</h2>
          <p className="hero-desc">누구든 쉽게 소통할 수 있는</p>
          <p className="hero-features">
            음성 입력 / 음성 번역 / 음성 출력 / 음성 STT<br />
            음성 인식 / 실시간 대화 / 실시간 자막 / STT TTS 번역으로<br />
            점자 기기 / 보조기 호환 음성 / 필담으로 간단하게 소통 가능
          </p>
          <div className="hero-buttons">
            <button className="home-signup-btn" onClick={() => navigate("/Signup")}>회원가입</button>
            <button className="login-btn" onClick={() => navigate("/login")}>로그인</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={MainDialogue} alt="대화 이미지" className="main-dialogue-img" />
        </div>
      </div>
      
      <div className="feature-section">
        <div className="feature-image">
          <img src={MainPhone} alt="음성 번역 앱" className="phone-img" />
        </div>
        <div className="feature-content right-align">
          <h3 className="feature-title">
            <span className="normal-text">원활한 소통을 위한</span>
            <span className="highlight">음성 번역</span>
          </h3>
        </div>
      </div>
      
      {/* 수어 인식 섹션 - 완전히 새로 작성 */}
      <div className="feature-section">
        <div className="feature-content">
          <h3 className="feature-title">
            <div className="inline-title">
              <span className="highlight">수어 인식</span>&nbsp;<span className="normal-text">후 자막 생성</span>
            </div>
          </h3>
        </div>
        <div className="feature-image">
          {/* 이미지가 있다면 여기에 추가 */}
        </div>
      </div>
      
      <div className="feature-section">
        <div className="feature-image">
          {/* 이미지가 있다면 여기에 추가 */}
        </div>
        <div className="feature-content right-align">
          <h3 className="feature-title">
            <span className="normal-text">상담을 위한</span>
            <span className="highlight">상담 전용 채널</span>
          </h3>
        </div>
      </div>
      
      <div className="feature-section">
        <div className="feature-content">
          <h3 className="feature-title">
            <span className="normal-text">누구나 어려움 없이</span>
            <span className="highlight">소통 채널 지원</span>
          </h3>
        </div>
        <div className="feature-image">
          {/* 이미지가 있다면 여기에 추가 */}
        </div>
      </div>
    </div>
  );
}

export default HomeMain;