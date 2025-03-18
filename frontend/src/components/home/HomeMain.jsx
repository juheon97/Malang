// src/components/home/HomeMain.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
// 폰트 CSS 파일 import
import "../../styles/fonts.css";
// SVG 로고 import
import MallangLogo from "../../assets/image/Mallang_logo.svg";
// 메인 대화 이미지 import
import MainDialogue from "../../assets/image/Main_dialogue.png";
import MainPhone from "../../assets/image/Main_phone.png";
// 원형 이미지 import
import MainGreenCircle from "../../assets/image/Main_green_circle.png";
import MainYellowCircle from "../../assets/image/Main_yellow_circle.png";
// 점 이미지 import
import MainDot1 from "../../assets/image/Main_dot1.png";
import MainDot2 from "../../assets/image/Main_dot2.png";

function HomeMain() {
  const navigate = useNavigate();
  
  // 각 섹션에 대한 ref 생성
  const featureSectionRefs = useRef([]);
  
  useEffect(() => {
    // Intersection Observer 설정
    const observerOptions = {
      root: null, // viewport를 root로 사용
      rootMargin: '0px',
      threshold: 0.2, // 요소의 20%가 보일 때 콜백 실행
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // 요소가 화면에 들어오면 애니메이션 클래스 추가
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-section');
        }
      });
    }, observerOptions);
    
    // 모든 feature 섹션에 대해 observer 설정
    featureSectionRefs.current.forEach(ref => {
      if (ref) sectionObserver.observe(ref);
    });
    
    // 컴포넌트 언마운트 시 observer 해제
    return () => {
      featureSectionRefs.current.forEach(ref => {
        if (ref) sectionObserver.unobserve(ref);
      });
    };
  }, []);
  
  // ref 배열에 새 ref 추가하는 함수
  const addToRefs = (el) => {
    if (el && !featureSectionRefs.current.includes(el)) {
      featureSectionRefs.current.push(el);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section" style={{ paddingTop: '80px', position: 'relative', overflow: 'visible' }}>
        {/* 원형 이미지 추가 - navbar와 겹치지 않도록 위치 조정 */}
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', overflow: 'visible', zIndex: '0' }}>
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
              maxWidth: 'none'
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
              maxWidth: 'none'
            }} 
          />
          {/* 점 이미지 추가 - 녹색 원 우측에서 약간 우상단으로 이동 */}
          <img 
            src={MainDot1} 
            alt="점 이미지" 
            className="shape-animation dot-animation"
            style={{ 
              position: 'absolute', 
              top: '130px', 
              left: '380px', 
              width: '40px', 
              height: '40px', 
              pointerEvents: 'none',
              objectFit: 'contain',
              maxWidth: 'none',
              zIndex: '0'
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
              zIndex: '5'
            }} 
          />
        </div>
        <div className="hero-content">
          <div className="logo-area">
            <img src={MallangLogo} alt="말랑 로고" className="hero-logo" />
            <h1 className="hero-title">말랑</h1>
          </div>
          <h2 className="hero-subtitle" style={{ marginBottom: '-10px' }}>Mallang</h2>
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
          {/* 이미지 크기 및 CSS 속성 조정하여 포인터 이벤트가 이미지를 통과하도록 함 */}
          <img 
            src={MainDialogue} 
            alt="대화 이미지" 
            className="main-dialogue-img" 
            style={{ pointerEvents: 'none', position: 'relative', zIndex: '1' }} // 원형 이미지보다 높은 z-index
          />
        </div>
      </div>
      
      {/* 음성 번역 섹션 - 애니메이션 적용 */}
      <div className="feature-section" ref={addToRefs}>
        <div className="feature-image slide-from-left">
          <img 
            src={MainPhone} 
            alt="음성 번역 앱" 
            className="phone-img" 
            style={{ pointerEvents: 'none' }} // 이미지 클릭 이벤트 무시
          />
        </div>
        <div className="feature-content right-align slide-from-right">
          <h3 className="feature-title">
            <span className="normal-text">원활한 소통을 위한</span>
            <span className="highlight">음성 번역</span>
          </h3>
        </div>
      </div>
      
      {/* 수어 인식 섹션 - 애니메이션 적용 */}
      <div className="feature-section" ref={addToRefs}>
        <div className="feature-content left-align slide-from-left">
          <h3 className="feature-title">
            <div className="inline-title">
              <span className="highlight">수어 인식</span>&nbsp;<span className="normal-text">후 자막 생성</span>
            </div>
          </h3>
        </div>
        <div className="feature-image slide-from-right">
          {/* 이미지가 있다면 여기에 추가 */}
        </div>
      </div>
      
      {/* 상담 전용 채널 섹션 - 애니메이션 적용 */}
      <div className="feature-section" ref={addToRefs}>
        <div className="feature-image slide-from-left">
          {/* 이미지가 있다면 여기에 추가 */}
        </div>
        <div className="feature-content right-align slide-from-right">
          <h3 className="feature-title">
            <span className="normal-text">상담을 위한</span>
            <span className="highlight">상담 전용 채널</span>
          </h3>
        </div>
      </div>
      
      {/* 소통 채널 지원 섹션 - 애니메이션 적용 */}
      <div className="feature-section" ref={addToRefs}>
        <div className="feature-content left-align slide-from-left">
          <h3 className="feature-title">
            <span className="normal-text">누구나 어려움 없이</span>
            <span className="highlight">소통 채널 지원</span>
          </h3>
        </div>
        <div className="feature-image slide-from-right">
          {/* 이미지가 있다면 여기에 추가 */}
        </div>
      </div>
    </div>
  );
}

export default HomeMain;