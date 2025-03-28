// src/components/community/LikeButton.jsx
import React, { useState, useEffect } from 'react';
import usePostStore from '../../store/postStore';

const LikeButton = ({ postId, likes, isLiked: initialIsLiked }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const { updateLikes } = usePostStore();

  // props가 변경되면 상태 업데이트
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(likes);
  }, [initialIsLiked, likes]);

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = async () => {
    try {
      // 좋아요 상태 토글
      const newIsLiked = !isLiked;
      const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
      
      // 상태 즉시 업데이트 (낙관적 UI 업데이트)
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);
      
      // API 호출
      await updateLikes(postId, newLikeCount, newIsLiked);
    } catch (err) {
      // 에러 발생 시 상태 복원
      setIsLiked(initialIsLiked);
      setLikeCount(likes);
      alert('좋아요 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <button 
        onClick={handleLikeClick}
        className={`flex items-center gap-2 px-4 py-3 bg-white rounded-full hover:bg-[#fff5f5] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 border ${
          isLiked ? 'text-[#ff6b6b] border-[#ffdddd]' : 'text-gray-400 border-gray-200'
        }`}
      >
        <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="font-bold">{likeCount}</span>
      </button>
    </div>
  );
};

export default LikeButton;
