// src/components/community/ReplyForm.jsx
import React, { useState } from 'react';
import useCommentStore from '../../store/commentStore';

const ReplyForm = ({ commentId, currentUser, onCancel }) => {
  const [replyContent, setReplyContent] = useState('');
  const { addReply } = useCommentStore();

  // 답글 제출 핸들러
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    try {
      const currentDate = new Date()
        .toLocaleDateString('ko-KR', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\. /g, '.')
        .replace(/\.$/, '');
      
      const replyData = {
        commentId: commentId,
        content: replyContent,
        authorId: currentUser.id,
        authorName: currentUser.username,
        date: currentDate
      };
      
      await addReply(commentId, replyData);
      setReplyContent('');
      onCancel();
    } catch (err) {
      alert('답글 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mt-3 ml-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="답글을 입력하세요..."
          value={replyContent}
          onChange={e => setReplyContent(e.target.value)}
          className="flex-1 px-3 py-2 border border-[#e0f0e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
        />
        <button
          onClick={handleReplySubmit}
          className="px-3 py-1 bg-[#8ed7af] text-white rounded-lg hover:bg-[#7bc89e] transition-colors shadow-sm hover:shadow-md"
        >
          등록
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default ReplyForm;
