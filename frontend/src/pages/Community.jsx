// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommunityList from '../components/community/CommunityList';
import { PostService } from '../api';
import '../styles/Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await PostService.getAllPosts();
        setPosts(response.data);
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        console.error('게시글 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleWriteClick = () => {
    navigate('/community/write');
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>
      
      <div className="community-content">
        {error && <div className="error-message">{error}</div>}
        
        {posts.length > 0 ? (
          <CommunityList posts={posts} />
        ) : (
          <div className="no-posts">등록된 게시글이 없습니다.</div>
        )}
        
        <div className="community-footer">
          <button className="write-button" onClick={handleWriteClick}>글쓰기</button>
        </div>
      </div>
    </div>
  );
};

export default Community;
