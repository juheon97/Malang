import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostService } from '../../api';

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
        const response = await PostService.getAllPosts(currentPage);

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
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <div className="text-center py-10">로딩 중...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="mt-16 max-w-6xl mx-auto relative">
      {/* 모든 배경 이미지들을 절대 위치로 배치 */}
      <img
        src="/src/assets/image/community/community_dot.svg"
        alt="도트 이미지"
        className="absolute"
        style={{
          left: '-40px',
          top: '280px',
          zIndex: '-1',
        }}
      />
      <img
        src="/src/assets/image/community/community_green_circle.svg"
        alt="초록 원 이미지"
        className="absolute"
        style={{
          right: '-120px',
          top: '-10px',
          zIndex: '-1',
        }}
      />
      <img
        src="/src/assets/image/community/community_yellow_green.svg"
        alt="노란초록 이미지"
        className="absolute"
        style={{
          left: '-200px',
          top: '-160px',
          width: '500px',
          height: '500px',
          zIndex: '-1',
        }}
      />

      {/* 제목을 박스 밖으로 뺌 */}
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-6">
        커뮤니티
      </h1>

      {/* 테이블과 페이지네이션, 글쓰기 버튼을 하나의 박스에 넣음 */}
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
          {/* 왼쪽 여백 공간 */}
          <div className="flex-1"></div>

          {/* 페이지네이션 (중앙) */}
          <div className="flex items-center space-x-2">
            {/* 이전 페이지 버튼 */}
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

            {/* 페이지 번호 버튼 */}
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

            {/* 다음 페이지 버튼 */}
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

          {/* 글쓰기 버튼 (오른쪽) */}
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
