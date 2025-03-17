// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        
        // 목 데이터의 구조에 맞게 처리
        if (response.data.posts) {
          // API 응답이 { posts: [...] } 형태인 경우
          setPosts(response.data.posts);
        } else if (Array.isArray(response.data)) {
          // API 응답이 직접 배열인 경우
          setPosts(response.data);
        } else {
          // 기타 경우 빈 배열로 설정
          setPosts([]);
          console.warn('Unexpected data format:', response.data);
        }
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        console.error('게시글 로딩 오류:', err);
        
        // 오류 발생 시 더미 데이터 설정 (테스트용)
        setPosts([
          { id: 1, category: '시각장애', title: '시각장애 관련 질문입니다', date: '25.03.17', likes: 5 },
          { id: 2, category: '구음장애', title: '구음장애 앱 사용법', date: '25.03.16', likes: 12 },
          { id: 3, category: '청각장애', title: '청각장애인을 위한 기능은 어떻게 사용하나요?', date: '25.03.15', likes: 8 }
        ]);
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
    <div className="bg-gradient-to-br from-[#e6f7f0] to-[#f0f9f5] rounded-xl shadow-md p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-8">커뮤니티</h1>
      
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {error && <div className="error-message">{error}</div>}
        
        {posts.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e0f0e9]">
                <th className="py-3 px-4 text-left text-sm font-medium text-[#00a173]">카테고리</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#00a173]">제목</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#00a173]">작성일</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#00a173]">좋아요</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr 
                  key={post.id} 
                  className="border-b border-[#e0f0e9] hover:bg-[#f5fdf9] transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/community/${post.id}`)}
                >
                  <td className="py-3 px-4 text-sm text-gray-700">{post.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs">{post.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{post.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-[#ff6b6b] mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {post.likes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-gray-500">등록된 게시글이 없습니다.</div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleWriteClick}
          className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200"
        >
          글쓰기
        </button>
      </div>
    </div>
  );
};

export default Community;
