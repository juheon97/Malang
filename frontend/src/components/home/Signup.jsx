// src/home/Signup.jsx
import React, { useState } from "react";
import "../../styles/Signup.css";

function Signup() {
  const [userType, setUserType] = useState("user"); // 일반 사용자(user) / 상담사(counselor)
  const [visionImpairment, setVisionImpairment] = useState("no");

  return (
    <div className="signup-container">
      <h1>회원가입</h1>
      <div className="tab-container">
        <button
          className={userType === "user" ? "active" : ""}
          onClick={() => setUserType("user")}
        >
          일반인 사용자
        </button>
        <button
          className={userType === "counselor" ? "active" : ""}
          onClick={() => setUserType("counselor")}
        >
          상담사
        </button>
      </div>
      
      <form className="signup-form">
        <label>닉네임 :</label>
        <input type="text" placeholder="닉네임을 입력하세요" />
        
        <label>이메일 :</label>
        <input type="email" placeholder="이메일을 입력하세요" />
        
        <label>비밀번호 :</label>
        <input type="password" placeholder="비밀번호를 입력하세요" />
        
        <label>시각장애 여부 :</label>
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              value="yes" 
              checked={visionImpairment === "yes"} 
              onChange={() => setVisionImpairment("yes")} 
            /> 예
          </label>
          <label>
            <input 
              type="radio" 
              value="no" 
              checked={visionImpairment === "no"} 
              onChange={() => setVisionImpairment("no")} 
            /> 아니요
          </label>
        </div>
        
        <button type="submit" className="signup-btn">회원가입</button>
      </form>
    </div>
  );
}

export default Signup;
