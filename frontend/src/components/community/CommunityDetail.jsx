// src/components/community/CommunityDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 게시글 데이터 불러오기 (실제로는 API 호출)
  useEffect(() => {
    // 임시 데이터
    const dummyPost = {
      id: parseInt(id),
      category: '시작장애',
      title: '시작장애에 어떻게 여기서 글을 쓰지? 구니까?',
      content: '인정?',
      date: '25.03.12',
      likes: 100,
      authorId: 1, // 현재 사용자와 같은 ID로 설정
      authorName: '익명의 리뷰어'
    };
    
    const dummyComments = [
      { 
        id: 1, 
        authorId: 1, 
        authorName: '익명의 리뷰어', 
        content: '우와 글쓰기~~~~!', 
        date: '25.03.14' 
      },
      { 
        id: 2, 
        authorId: 2, 
        authorName: '다른 사용자', 
        content: '좋은 글이네요!', 
        date: '25.03.15' 
      }
    ];
    
    setPost(dummyPost);
    setComments(dummyComments);
    setLikes(dummyPost.likes);
    setEditTitle(dummyPost.title);
    setEditContent(dummyPost.content);
  }, [id]);

  const handleLikeClick = () => {
    setLikes(likes + 1);
  };

  const handleCommentSubmit = (comment) => {
    const newComment = {
      id: comments.length + 1,
      authorId: currentUser.id,
      authorName: currentUser.username,
      content: comment,
      date: new Date().toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace(/\.$/, '')
    };
    
    setComments([...comments, newComment]);
  };

  const handleDeletePost = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      // 실제로는 API 호출하여 서버에서 삭제
      console.log('게시글 삭제:', post.id);
      navigate('/community');
    }
  };

  const handleEditPost = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSaveEdit = () => {
    // 실제로는 API 호출하여 서버에 업데이트
    const updatedPost = {
      ...post,
      title: editTitle,
      content: editContent
    };
    
    setPost(updatedPost);
    setIsEditing(false);
    console.log('게시글 수정:', updatedPost);
  };

  const handleUpdateComment = (commentId, newContent) => {
    setComments(
      comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent } 
          : comment
      )
    );
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  if (!post) return <div>로딩 중...</div>;

  const isAuthor = currentUser && post.authorId === currentUser.id;

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>
      
      <div className="community-content">
        {isEditing ? (
          <div className="post-edit-form">
            <div className="post-category">{post.category}</div>
            <input
              type="text"
              className="title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="content-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="edit-buttons">
              <button className="cancel-button" onClick={handleCancelEdit}>취소</button>
              <button className="save-button" onClick={handleSaveEdit}>저장</button>
            </div>
          </div>
        ) : (
          <>
            <div className="post-header">
              <div className="post-category">{post.category}</div>
              <div className="post-title">{post.title}</div>
              <div className="post-info">
                <span className="post-author">{post.authorName}</span>
                <span className="post-date">{post.date}</span>
              </div>
            </div>
            
            <div className="post-content">
              {post.content}
            </div>
            
            <div className="post-actions">
              <div className="left-actions">
                <button className="back-button" onClick={() => navigate('/community')}>목록보기</button>
                {isAuthor && (
                  <>
                    <button className="edit-button" onClick={handleEditPost}>수정</button>
                    <button className="delete-button" onClick={handleDeletePost}>삭제</button>
                  </>
                )}
              </div>
              <button className="like-button" onClick={handleLikeClick}>
                좋아요 <span className="like-count">{likes}</span>
              </button>
            </div>
          </>
        )}
        
        <div className="comments-section">
          <h3>댓글</h3>
          <CommentList 
            comments={comments} 
            currentUser={currentUser}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
          <CommentForm onSubmit={handleCommentSubmit} />
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
