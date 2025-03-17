import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostService } from '../../api';
import axios from 'axios';

const CommunityList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // PostService 사용하여 데이터 가져오기
        const response = await PostService.getAllPosts(currentPage);
        
        // 응답 구조에 맞게 데이터 처리
        if (response.data.posts) {
          setPosts(response.data.posts);
          setTotalPages(response.data.totalPages || 3);
        } else {
          setPosts(response.data);
          setTotalPages(3);
        }
      } catch (err) {
        console.error('게시글 목록 로딩 오류:', err);
        setError('게시글 목록을 불러오는 중 오류가 발생했습니다.');
        // 오류 처리는 그대로 유지 (더미 데이터 설정)
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <div className="text-center py-10">로딩 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-gradient-to-br from-[#e6f7f0] to-[#f0f9f5] rounded-xl shadow-md p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-8">커뮤니티</h1>
      
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
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
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-1">
          <button 
            className="px-3 py-1 rounded-full bg-[#8ed7af] text-white hover:bg-[#7bc89e] transition-colors disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`px-3 py-1 rounded-full ${
                currentPage === page 
                  ? 'bg-white text-[#00a173] border border-[#8ed7af]' 
                  : 'bg-white text-[#00a173] hover:bg-[#f5fdf9] transition-colors'
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="px-3 py-1 rounded-full bg-[#8ed7af] text-white hover:bg-[#7bc89e] transition-colors disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/community/write')}
          className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200"
        >
          글쓰기
        </button>
      </div>
    </div>
  );
};

export default CommunityList;
