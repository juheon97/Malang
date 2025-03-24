import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePostStore from '../../store/postStore';
import useCommentStore from '../../store/commentStore';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Post 스토어에서 상태와 액션 가져오기
  const {
    currentPost: post,
    loading: postLoading,
    error: postError,
    fetchPostById,
    updatePost,
    deletePost,
    updateLikes,
    removeImage,
    resetCurrentPost,
  } = usePostStore();

  // Comment 스토어에서 상태와 액션 가져오기
  const {
    comments,
    loading: commentLoading,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    fetchComments,
    resetComments,
  } = useCommentStore();

  // 로컬 상태
  const [comment, setComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 현재 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  const currentUser = {
    id: 1,
    username: '익명의 리뷰어',
  };

  // 게시글 및 댓글 데이터 불러오기
  useEffect(() => {
    fetchPostById(id);
    fetchComments(id);

    // 컴포넌트 언마운트 시 상태 초기화
    return () => {
      resetCurrentPost();
      resetComments();
    };
  }, [id, fetchPostById, fetchComments, resetCurrentPost, resetComments]);

  // 게시글 데이터가 로드되면 수정 폼 초기화
  useEffect(() => {
    if (post) {
      setEditTitle(post.title);
      setEditContent(post.content);
    }
  }, [post]);

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = async () => {
    try {
      const updatedLikes = post.likes + 1;
      await updateLikes(id, updatedLikes);
    } catch (err) {
      alert('좋아요 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 댓글 제출 핸들러
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
        postId: parseInt(id),
        content: comment,
        authorId: currentUser.id,
        authorName: currentUser.username,
        date: currentDate,
        replies: [],
      };

      await addComment(id, commentData);
      setComment('');
    } catch (err) {
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // 게시글 수정 시작 핸들러
  const handleEditStart = () => {
    setIsEditing(true);
  };

  // 게시글 수정 취소 핸들러
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  // 게시글 수정 저장 핸들러
  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await updatePost(id, {
        title: editTitle,
        content: editContent,
      });

      setIsEditing(false);
      alert('게시글이 수정되었습니다.');
    } catch (err) {
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await deletePost(id);
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = index => {
    if (window.confirm('이미지를 삭제하시겠습니까?')) {
      removeImage(index);
    }
  };

  // 답글 작성 시작 핸들러
  const handleReplyComment = commentId => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  // 답글 작성 취소 핸들러
  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  // 답글 제출 핸들러
  const handleReplySubmit = async commentId => {
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
        date: currentDate,
      };

      await addReply(commentId, replyData);
      setReplyingTo(null);
      setReplyContent('');
    } catch (err) {
      alert('답글 작성 중 오류가 발생했습니다.');
    }
  };

  if (postLoading || commentLoading)
    return <div className="text-center py-10">로딩 중...</div>;
  if (postError)
    return <div className="text-center py-10 text-red-500">{postError}</div>;
  if (!post)
    return <div className="text-center py-10">게시글을 찾을 수 없습니다.</div>;

  const isAuthor = currentUser.id === post.authorId;

  return (
    <div className="mt-16 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-6">
        커뮤니티
      </h1>
    
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <div className="mb-6">
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 mb-4 bg-white border border-[#e0e7e0] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
              />
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-white border border-[#e0e7e0] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af] resize-none"
              />

              {/* 첨부 이미지 표시 및 삭제 기능 */}
              {(post.fileUrls || post.fileUrl) && (
                <div className="mt-4 border border-[#e0e7e0] rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">첨부된 이미지</h4>
                  </div>
                  <div className="relative">
                    {Array.isArray(post.fileUrls) ? (
                      post.fileUrls.map((url, index) => (
                        <div key={index} className="relative mb-2">
                          <img
                            src={url}
                            alt={`첨부 이미지 ${index + 1}`}
                            className="max-w-full rounded-lg shadow-sm mx-auto"
                            style={{ maxHeight: '200px' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="relative mb-2">
                        <img
                          src={post.fileUrls || post.fileUrl}
                          alt="첨부 이미지"
                          className="max-w-full rounded-lg shadow-sm mx-auto"
                          style={{ maxHeight: '200px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(0)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 border-b border-[#00a173] border-opacity-30 pb-4">
                <div className="inline-block px-3 py-1 bg-[#8ed7af] text-white text-xs rounded-full mb-2">
                  {post.category}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {post.title}
                </h2>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{post.authorName}</span>
                  <span>{post.date}</span>
                </div>
              </div>

              <div className="min-h-[200px] mb-8 text-gray-700">
                {post.content}

                {/* 첨부 이미지가 있으면 표시 */}
                {(post.fileUrls || post.fileUrl) && (
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {Array.isArray(post.fileUrls) ? (
                      post.fileUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`첨부 이미지 ${index + 1}`}
                          className="max-w-full rounded-lg shadow-md mx-auto"
                          style={{ maxHeight: '400px' }}
                        />
                      ))
                    ) : (
                      <img
                        src={post.fileUrls || post.fileUrl}
                        alt="첨부 이미지"
                        className="max-w-full rounded-lg shadow-md mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={() => navigate('/community')}
                  className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors shadow-md hover:shadow-lg"
                >
                  목록보기
                </button>

                {isAuthor && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditStart}
                      className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors shadow-md hover:shadow-lg"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors shadow-md hover:shadow-lg"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="border-t border-[#00a173] border-opacity-30 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>

            <div className="space-y-4 mb-6">
              {comments.map(comment => (
                <div
                  key={comment.id}
                  className="bg-[#f9fcfa] p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-[#00a173]">
                      {comment.authorName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {comment.date}
                    </span>
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
                          onClick={() => handleReplySubmit(comment.id)}
                          className="px-3 py-1 bg-[#8ed7af] text-white rounded-lg hover:bg-[#7bc89e] transition-colors shadow-sm hover:shadow-md"
                        >
                          등록
                        </button>
                        <button
                          onClick={handleReplyCancel}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 답글 목록 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-2">
                      {comment.replies.map(reply => (
                        <div
                          key={reply.id}
                          className="bg-white p-3 rounded-lg shadow-sm border border-[#e0f0e9]"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-[#00a173]">
                              {reply.authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {reply.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

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
          </div>

          {/* 좋아요 버튼 */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-2 px-4 py-3 bg-white text-[#ff6b6b] rounded-full hover:bg-[#fff5f5] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 border border-[#ffdddd]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-bold">{post.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
