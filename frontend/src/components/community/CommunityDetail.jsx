// src/components/community/CommunityDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
<<<<<<< HEAD
=======
import { PostService, CommentService } from '../../api';
>>>>>>> parent of 550c008 (Revert "Merge branch 'dev_FE' into 'master'")
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
<<<<<<< HEAD

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
=======
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        
        // PostService를 사용하여 특정 ID의 게시글 가져오기
        const response = await PostService.getPostById(id);
        const postData = response.data;
        
        setPost(postData);
        setLikes(postData.likes);
        setEditTitle(postData.title);
        setEditContent(postData.content);
        
        // 댓글 데이터 가져오기
        if (postData.comments) {
          setComments(postData.comments);
        } else {
          const commentsResponse = await CommentService.getCommentsByPostId(id);
          setComments(commentsResponse.data);
        }
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        console.error('게시글 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]); // id가 변경될 때마다 데이터를 다시 불러옴

  const handleLikeClick = async () => {
    try {
      // 좋아요 수 증가
      const updatedLikes = likes + 1;
      setLikes(updatedLikes);
      
      // API를 통해 서버에 업데이트 (실제 구현 시)
      await PostService.updatePost(id, { likes: updatedLikes });
    } catch (err) {
      console.error('좋아요 업데이트 오류:', err);
      // 실패 시 원래 값으로 복원
      setLikes(likes);
    }
  };

  const handleCommentSubmit = async (comment) => {
    try {
      const commentData = {
        content: comment,
        authorId: currentUser.id,
        authorName: currentUser.username,
        date: new Date().toLocaleDateString('ko-KR', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '.').replace(/\.$/, '')
      };
      
      // API를 통해 댓글 생성
      const response = await CommentService.createComment(id, commentData);
      const newComment = response.data;
      
      // 함수형 업데이트를 사용하여 이전 상태에 의존하지 않도록 함
      setComments(prevComments => [...prevComments, newComment]);
      return true; // 성공 시 true 반환
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      alert('댓글 작성 중 오류가 발생했습니다.');
      return false; // 실패 시 false 반환
    }
  };
  
  const handleDeletePost = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        // API를 통해 게시글 삭제
        await PostService.deletePost(id);
        alert('게시글이 삭제되었습니다.');
        navigate('/community');
      } catch (err) {
        console.error('게시글 삭제 오류:', err);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
>>>>>>> parent of 550c008 (Revert "Merge branch 'dev_FE' into 'master'")
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

<<<<<<< HEAD
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
=======
  const handleSaveEdit = async () => {
    try {
      const updatedPostData = {
        title: editTitle,
        content: editContent
      };
      
      // API를 통해 게시글 업데이트
      const response = await PostService.updatePost(id, updatedPostData);
      const updatedPost = response.data;
      
      setPost(updatedPost);
      setIsEditing(false);
      alert('게시글이 수정되었습니다.');
    } catch (err) {
      console.error('게시글 수정 오류:', err);
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      // API를 통해 댓글 업데이트
      await CommentService.updateComment(commentId, { content: newContent });
      
      // 댓글 목록 업데이트
      setComments(
        comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: newContent } 
            : comment
        )
      );
    } catch (err) {
      console.error('댓글 수정 오류:', err);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        // API를 통해 댓글 삭제
        await CommentService.deleteComment(commentId);
        
        // 댓글 목록 업데이트
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (err) {
        console.error('댓글 삭제 오류:', err);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="not-found">게시글을 찾을 수 없습니다.</div>;
>>>>>>> parent of 550c008 (Revert "Merge branch 'dev_FE' into 'master'")

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
