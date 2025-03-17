import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const CommunityWrite = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('시작장애');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData = {
        title,
        content,
        category,
        authorId: currentUser.id,
        authorName: currentUser.username,
        likes: 0,
      };

      await PostService.createPost(postData);
      alert('게시글이 성공적으로 등록되었습니다.');
      navigate('/community');
    } catch (err) {
      setError('게시글 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('게시글 등록 오류:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>

      <div className="community-content">
        <div className="category-selector">
          <button className="category-button active">카테고리</button>
          <div className="category-dropdown">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
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
            onChange={e => setTitle(e.target.value)}
            required
          />

          <textarea
            className="content-textarea"
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWrite;
