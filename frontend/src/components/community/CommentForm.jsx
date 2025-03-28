// src/components/community/CommentForm.jsx
import React, { useState } from 'react';
import useCommentStore from '../../store/commentStore';

const CommentForm = ({ postId, currentUser }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment } = useCommentStore();

  const handleCommentSubmit = async e => {
    e.preventDefault();

    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      const currentDate = new Date()
        .toLocaleDateString('ko-KR', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\. /g, '.')
        .replace(/\.$/, '');

      const commentData = {
        postId: parseInt(postId),
        content: comment,
        authorId: currentUser.id,
        authorName: currentUser.username,
        date: currentDate,
        replies: [],
      };

      await addComment(postId, commentData);
      setComment('');
    } catch (err) {
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCommentSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="댓글을 입력하세요..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 border border-[#e0f0e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ed7af] disabled:opacity-50"
      />
      <button 
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-[#8ed7af] text-white rounded-lg hover:bg-[#7bc89e] transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '입력 중...' : '입력'}
      </button>
    </form>
  );
};

export default CommentForm;
