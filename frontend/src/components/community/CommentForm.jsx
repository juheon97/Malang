import React, { useState, useRef } from 'react';

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  

  const handleSubmit = async e => {
    e.preventDefault();

    // 이미 제출 중이거나 내용이 비어있으면 제출하지 않음
    if (isSubmitting || !comment.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(comment);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit} ref={formRef}>
      <input
        type="text"
        placeholder="댓글을 입력하세요..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="comment-input"
        disabled={isSubmitting}
      />
      <button type="submit" className="comment-submit" disabled={isSubmitting}>
        {isSubmitting ? '입력 중...' : '입력'}
      </button>
    </form>
  );
};

export default CommentForm;
