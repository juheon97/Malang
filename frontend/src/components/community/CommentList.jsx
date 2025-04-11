// src/components/community/CommentList.jsx
import React from 'react';
import CommentItem from './CommentItem';

const CommentList = ({ comments, currentUser, postId }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
      </div>
    );
  }
  
  return (
    <div className="space-y-4 mb-6">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          currentUser={currentUser} 
          postId={postId} 
        />
      ))}
    </div>
  );
};

export default CommentList;
