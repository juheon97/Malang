import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostService } from '../../api';
import axios from 'axios'; // axios 설치 필요

const CommunityWrite = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('시각장애');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 현재 날짜 생성
      const currentDate = new Date().toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace(/\.$/, '');
      
      // 게시글 데이터 구성
      const postData = {
        title,
        content,
        category,
        date: currentDate,
        authorId: 1, // 실제로는 로그인한 사용자 ID
        authorName: '익명의 리뷰어', // 실제로는 로그인한 사용자 이름
        likes: 0
      };
      
      // API 호출 (실제 API 엔드포인트로 변경 필요)
      const response = await PostService.createPost(postData);
      
      console.log('게시글 작성 성공:', response.data);
      alert('게시글이 성공적으로 등록되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#f5fdf5] rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-8">커뮤니티</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex space-x-2">
          <button 
            type="button"
            className="px-4 py-2 bg-[#8ed7af] text-white rounded-full text-sm font-medium"
          >
            카테고리
          </button>
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-[#e0e7e0] rounded-full text-sm font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
            >
              <option value="시각장애">시각장애</option>
              <option value="구음장애">구음장애</option>
              <option value="청각장애">청각장애</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="제목을 입력해주세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-[#e0e7e0] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
          required
        />
        
        <textarea
          placeholder="내용을 입력해주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 px-4 py-3 bg-white border border-[#e0e7e0] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af] resize-none"
          required
        />
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#8ed7af] text-white rounded-full text-sm font-medium hover:bg-[#7bc89e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityWrite;
