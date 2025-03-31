// src/components/community/CommunityDetail.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePostStore from '../../store/postStore';
import PostContent from './PostContent';
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Post 스토어에서 상태와 액션 가져오기
  const { 
    currentPost: post, 
    comments,
    loading, 
    error,
    fetchPostById,
    resetCurrentPost
  } = usePostStore();
  
  // 현재 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  const currentUser = {
    id: 1,
    username: '익명의 리뷰어'
  };

  // 게시글 데이터 불러오기
  useEffect(() => {
    fetchPostById(id);
    
    // 컴포넌트 언마운트 시 상태 초기화
    return () => {
      resetCurrentPost();
    };
  }, [id, fetchPostById, resetCurrentPost]);

  if (loading)
    return <div className="text-center py-10">로딩 중...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!post)
    return <div className="text-center py-10">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-6">
        커뮤니티
      </h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {/* 게시글 내용 컴포넌트 */}
          <PostContent 
            post={post} 
            currentUser={currentUser} 
            navigate={navigate} 
          />
          
          {/* 댓글 섹션 컴포넌트 */}
          <CommentSection 
            postId={id} 
            comments={comments}
            currentUser={currentUser} 
          />
          
          {/* 좋아요 버튼 컴포넌트 */}
          <LikeButton 
            postId={id} 
            likes={post.likes} 
            isLiked={post.isLiked}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
