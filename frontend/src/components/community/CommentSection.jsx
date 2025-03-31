// src/components/community/CommentSection.jsx
import React, { useState } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

const CommentSection = ({ postId, comments, currentUser }) => {
  return (
    <div className="border-t border-[#00a173] border-opacity-30 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>
      
      {/* 댓글 목록 */}
      <CommentList 
        comments={comments} 
        currentUser={currentUser} 
        postId={postId} 
      />
      
      {/* 댓글 작성 폼 */}
      <CommentForm postId={postId} currentUser={currentUser} />
    </div>
  );
};

export default CommentSection;
