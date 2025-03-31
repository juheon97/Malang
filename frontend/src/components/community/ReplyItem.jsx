// src/components/community/ReplyItem.jsx
import React, { useState } from 'react';
import useCommentStore from '../../store/commentStore';

const ReplyItem = ({ reply, commentId, currentUser }) => {
  const { updateReply, deleteReply } = useCommentStore();
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  // 답글 수정 시작 핸들러
  const handleEditReplyStart = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content);
  };

  // 답글 수정 취소 핸들러
  const handleEditReplyCancel = () => {
    setEditingReplyId(null);
    setEditReplyContent('');
  };

  // 답글 수정 저장 핸들러
  const handleEditReplySave = async (commentId, replyId) => {
    if (!editReplyContent.trim()) return;
    
    try {
      await updateReply(commentId, replyId, {
        content: editReplyContent
      });
      
      setEditingReplyId(null);
      setEditReplyContent('');
    } catch (err) {
      alert('답글 수정 중 오류가 발생했습니다.');
    }
  };

  // 답글 삭제 핸들러
  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('정말로 이 답글을 삭제하시겠습니까?')) return;
    
    try {
      await deleteReply(commentId, replyId);
    } catch (err) {
      alert('답글 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-[#e0f0e9]">
      {editingReplyId === reply.id ? (
        <div className="mt-2">
          <textarea
            value={editReplyContent}
            onChange={e => setEditReplyContent(e.target.value)}
            className="w-full px-3 py-2 border border-[#e0f0e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
            rows="2"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleEditReplyCancel}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
            >
              취소
            </button>
            <button
              onClick={() => handleEditReplySave(commentId, reply.id)}
              className="px-3 py-1 bg-[#8ed7af] text-white rounded-full text-xs hover:bg-[#7bc89e] transition-colors shadow-sm hover:shadow-md"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-[#00a173]">
              {reply.authorName}
            </span>
            <span className="text-xs text-gray-500">
              {reply.date}
            </span>
          </div>
          <p className="text-sm text-gray-700">{reply.content}</p>
          {currentUser.id === reply.authorId && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => handleEditReplyStart(reply)}
                className="text-xs text-gray-500 hover:text-[#00a173]"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteReply(commentId, reply.id)}
                className="text-xs text-gray-500 hover:text-[#ff6b6b]"
              >
                삭제
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReplyItem;
