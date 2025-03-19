// src/components/home/HomeMain3.jsx
import React from 'react';
import '../../styles/home/Home3.css';

const HomeMain3 = () => {
  return (
    <>
      <div className="feature-content left-align slide-from-left">
        <h3 className="feature-title">
          <div className="inline-title">
            <span className="highlight">수어 인식</span>&nbsp;
            <span className="normal-text">후 자막 생성</span>
          </div>
        </h3>
      </div>
      <div className="feature-image slide-from-right">
        {/* 이미지가 있다면 여기에 추가 */}
      </div>
    </>
  );
};

export default HomeMain3;
