// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommunityList from '../components/community/CommunityList';
import '../styles/Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  // 게시글 데이터 불러오기 (실제로는 API 호출)
  useEffect(() => {
    // 임시 데이터
    const dummyPosts = [
      { id: 1, category: '시작장애', title: '시작장애에 어떻게 여기서 글을 쓰지?', date: '25.03.12', likes: 56 },
      { id: 2, category: '인정?', title: '우와 글쓰기~~~~!', date: '25.03.14', likes: 100 },
    ];
    setPosts(dummyPosts);
  }, []);

  // 글쓰기 페이지로 이동
  const handleWriteClick = () => {
    navigate('/community/write');
  };

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>
      
      <div className="community-content">
        <CommunityList posts={posts} />
        
        <div className="community-footer">
          <button className="write-button" onClick={handleWriteClick}>글쓰기</button>
        </div>
      </div>
    </div>
  );
};

export default Community;
