// src/pages/community/community.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CommunityList from '../../components/community/CommunityList';
import CommunityDetail from '../../components/community/CommunityDetail';
import CommunityWrite from '../../components/community/CommunityWrite';

const Community = () => {
  // 배경 이미지는 공통 요소이므로 여기로 이동
  const backgroundImages = (
    <>
      <img
        src="/src/assets/image/community/community_dot.svg"
        alt="도트 이미지"
        className="fixed"
        style={{
          left: '-40px',
          top: '280px',
          zIndex: '-1',
        }}
      />
      <img
        src="/src/assets/image/community/community_green_circle.svg"
        alt="초록 원 이미지"
        className="fixed"
        style={{
          right: '-120px',
          top: '-10px',
          zIndex: '-1',
        }}
      />
      <img
        src="/src/assets/image/community/community_yellow_green.svg"
        alt="노란초록 이미지"
        className="fixed"
        style={{
          left: '-200px',
          top: '-160px',
          width: '500px',
          height: '500px',
          zIndex: '-1',
        }}
      />
    </>
  );

  return (
    <div className="mt-16 relative">
      {/* 공통 배경 이미지 */}
      {backgroundImages}
      
      {/* 라우팅 설정 */}
      <Routes>
        <Route path="/" element={<CommunityList />} />
        <Route path="/:id" element={<CommunityDetail />} />
        <Route path="/write" element={<CommunityWrite />} />
        <Route path="*" element={<Navigate to="/community" />} />
      </Routes>
    </div>
  );
};

export default Community;
