// src/home/HomeMain.jsx
import React from "react";
import "../../styles/Home.css";

function HomeMain() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>말랑</h1>
        <h2>Mallang</h2>
        <p>누구든 쉽게 소통할 수 있는</p>
        <p>음성 입력 / 음성 번역 / 음성 출력 / 음성 STT</p>
        <button className="signup-btn">회원가입</button>
        <button className="login-btn">로그인</button>
      </div>
      
      <div className="section">
        <h3>원활한 소통을 위한 <span>음성 번역</span></h3>
      </div>
      
      <div className="section">
        <h3><span>수어 인식</span> 후 자막 생성</h3>
      </div>
      
      <div className="section">
        <h3>상담을 위한 <span>상담 전용 채널</span></h3>
      </div>
      
      <div className="section">
        <h3>누구나 어려움 없이 <span>소통 채널 지원</span></h3>
      </div>
    </div>
  );
}

export default HomeMain;
