// src/components/community/CommentItem.jsx
import React, { useState } from 'react';
import useCommentStore from '../../store/commentStore';
import ReplyList from './ReplyList';
import ReplyForm from './ReplyForm';

const CommentItem = ({ comment, currentUser, postId }) => {
  const { updateComment, deleteComment } = useCommentStore();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // 댓글 수정 시작 핸들러
  const handleEditCommentStart = comment => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  // 댓글 수정 취소 핸들러
  const handleEditCommentCancel = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  // 댓글 수정 저장 핸들러
  const handleEditCommentSave = async commentId => {
    if (!editCommentContent.trim()) return;

    try {
      await updateComment(commentId, {
        content: editCommentContent,
      });

      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (err) {
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async commentId => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment(commentId);
    } catch (err) {
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 답글 작성 시작 핸들러
  const handleReplyComment = commentId => {
    setReplyingTo(commentId);
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
  };

  return (
    <div className="bg-[#f9fcfa] p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-[#00a173]">{comment.authorName}</span>
        <span className="text-sm text-gray-500">{comment.date}</span>
      </div>

      {editingCommentId === comment.id ? (
        <div className="mt-2">
          <textarea
            value={editCommentContent}
            onChange={e => setEditCommentContent(e.target.value)}
            className="w-full px-3 py-2 border border-[#e0f0e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
            rows="3"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleEditCommentCancel}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
            >
              취소
            </button>
            <button
              onClick={() => handleEditCommentSave(comment.id)}
              className="px-3 py-1 bg-[#8ed7af] text-white rounded-full text-xs hover:bg-[#7bc89e] transition-colors shadow-sm hover:shadow-md"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700">{comment.content}</p>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => handleReplyComment(comment.id)}
              className="text-xs text-[#00a173] hover:underline px-2 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-[#f0f9f5]"
            >
              답글
            </button>
            {currentUser.id === comment.authorId && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCommentStart(comment)}
                  className="text-xs text-gray-500 hover:text-[#00a173]"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-gray-500 hover:text-[#ff6b6b]"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 답글 작성 폼 */}
      {replyingTo === comment.id && (
        <ReplyForm
          commentId={comment.id}
          currentUser={currentUser}
          onCancel={handleReplyCancel}
        />
      )}

      {/* 답글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <ReplyList
          replies={comment.replies}
          commentId={comment.id}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default CommentItem;
