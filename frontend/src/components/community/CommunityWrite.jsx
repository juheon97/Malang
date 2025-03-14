// src/components/community/CommunityWrite.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CommunityWrite = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('시작장애');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 실제로는 API 호출하여 서버에 데이터 전송
    const newPost = {
        title,
        content,
        category,
        authorId: currentUser.id,
        authorName: currentUser.username,
        date: new Date().toLocaleDateString('ko-KR', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '.').replace(/\.$/, ''),
        likes: 0
      };
      
      console.log(newPost);
    
      // 작성 완료 후 목록으로 이동
      navigate('/community');
  };

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>
      
      <div className="community-content">
        <div className="category-selector">
          <button className="category-button active">카테고리</button>
          <div className="category-dropdown">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="시작장애">시작장애</option>
              <option value="청각장애">청각장애</option>
            </select>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="title-input" 
            placeholder="제목을 입력해주세요." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <textarea 
            className="content-textarea" 
            placeholder="내용을 입력해주세요." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          
          <div className="form-buttons">
            <button type="submit" className="submit-button">등록하기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWrite;
