// src/components/community/CommentList.jsx
import React, { useState } from 'react';


const CommentList = ({
  comments,
  currentUser,
  onUpdateComment,
  onDeleteComment,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleEditClick = comment => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = commentId => {
    onUpdateComment(commentId, editContent);
    setEditingId(null);
  };

  return (
    <div className="comment-list">
      {comments.map((comment, index) => (
        <div key={`comment-${comment.id}-${index}`} className="comment-item">
          <div className="comment-header">
            <span className="comment-author">{comment.authorName}</span>
            <span className="comment-date">{comment.date}</span>
          </div>

          {editingId === comment.id ? (
            <div className="comment-edit">
              <input
                type="text"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="comment-edit-input"
              />
              <div className="comment-edit-buttons">
                <button onClick={handleCancelEdit}>취소</button>
                <button onClick={() => handleSaveEdit(comment.id)}>저장</button>
              </div>
            </div>
          ) : (
            <>
              <div className="comment-content">{comment.content}</div>
              {currentUser && comment.authorId === currentUser.id && (
                <div className="comment-actions">
                  <button onClick={() => handleEditClick(comment)}>수정</button>
                  <button onClick={() => onDeleteComment(comment.id)}>
                    삭제
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
