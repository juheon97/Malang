// src/components/community/CommunityList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostStore from '../../store/postStore';

const CommunityList = () => {
  const navigate = useNavigate();
  const { 
    posts, 
    loading, 
    error, 
    totalPages, 
    currentPage, 
    category,
    sort,
    fetchPosts,
    setSortOrder,
    setCategory
  } = usePostStore();

  // 카테고리 옵션
  const categories = [
    { value: null, label: '전체' },
    { value: '시각장애', label: '시각장애' },
    { value: '구음장애', label: '구음장애' },
    { value: '청각장애', label: '청각장애' }
  ];

  useEffect(() => {
    fetchPosts(currentPage, 10, category, sort);
  }, [fetchPosts, currentPage, category, sort]);

  useEffect(() => {
    // 초기 데이터 로딩
    fetchPosts(1, 10, null, 'latest');
  }, []);

  const handlePageChange = page => {
    if (page < 1 || page > totalPages) return;
    fetchPosts(page, 10, category, sort);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value === '전체' ? null : e.target.value;
    setCategory(newCategory);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  if (loading) return <div className="text-center py-10">로딩 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="mt-16 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-6">
        커뮤니티
      </h1>

      {/* 필터링 및 정렬 옵션 */}
      <div className="mb-4 flex justify-between">
        <div>
          <select 
            value={category || '전체'} 
            onChange={handleCategoryChange}
            className="px-3 py-2 border border-[#e0e7e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
          >
            {categories.map(cat => (
              <option key={cat.label} value={cat.value || '전체'}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select 
            value={sort} 
            onChange={handleSortChange}
            className="px-3 py-2 border border-[#e0e7e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-hidden px-24 pt-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#00a173] border-opacity-30 border-t-2 border-[#00a173] border-opacity-30">
                <th className="py-4 px-6 text-left text-sm font-medium text-[#00a173]">
                  카테고리
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#00a173]">
                  제목
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#00a173]">
                  작성일
                </th>
                <th className="py-4 px-6 text-left text-sm font-medium text-[#00a173]">
                  좋아요
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr
                  key={post.id}
                  className="border-b border-[#00a173] border-opacity-30 hover:bg-[#f5fdf9] transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/community/${post.id}`)}
                >
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {post.category}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700 truncate">
                    {post.title}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {post.date}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-5 h-5 text-[#ff6b6b] mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {post.likes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 페이지네이션과 글쓰기 버튼 */}
        <div className="flex items-center py-4 px-24">
          <div className="flex-1"></div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-full ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-[#00a173] hover:text-[#008c63]'
              } transition-colors`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-full font-medium ${
                  currentPage === page
                    ? 'text-[#00a173] font-bold'
                    : 'text-gray-500 hover:text-[#00a173]'
                } transition-colors`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-full ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-[#00a173] hover:text-[#008c63]'
              } transition-colors`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={() => navigate('/community/write')}
              className="px-6 py-2 bg-[#8ed7af] text-white rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-[2px] transition-transform duration-[200ms]"
            >
              글쓰기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityList;
