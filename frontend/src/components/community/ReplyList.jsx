// src/components/community/ReplyList.jsx
import React from 'react';
import ReplyItem from './ReplyItem';

const ReplyList = ({ replies, commentId, currentUser }) => {
  return (
    <div className="mt-4 ml-4 space-y-2">
      {replies.map(reply => (
        <ReplyItem 
          key={reply.id} 
          reply={reply} 
          commentId={commentId} 
          currentUser={currentUser} 
        />
      ))}
    </div>
  );
};

export default ReplyList;
