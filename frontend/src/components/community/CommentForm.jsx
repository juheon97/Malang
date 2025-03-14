// src/components/community/CommentForm.jsx
import React, { useState } from 'react';

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="댓글을 입력하세요..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="comment-input"
      />
      <button type="submit" className="comment-submit">입력</button>
    </form>
  );
};

export default CommentForm;
