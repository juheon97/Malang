// src/components/community/PostContent.jsx
import React, { useState, useEffect } from 'react';
import usePostStore from '../../store/postStore';

const PostContent = ({ post, currentUser, navigate }) => {
  const { updatePost, deletePost, removeImage } = usePostStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 게시글 데이터가 로드되면 수정 폼 초기화
  useEffect(() => {
    if (post) {
      setEditTitle(post.title);
      setEditContent(post.content);
      setEditCategory(post.category || '시각장애');
      
      // 이미지 초기화
      if (post.fileUrls) {
        const initialImages = Array.isArray(post.fileUrls) 
          ? post.fileUrls.map(url => ({ file_key: url, action: 'keep' }))
          : post.fileUrls ? [{ file_key: post.fileUrls, action: 'keep' }] : [];
        
        setImages(initialImages);
      } else if (post.fileUrl) {
        setImages([{ file_key: post.fileUrl, action: 'keep' }]);
      } else {
        setImages([]);
      }
    }
  }, [post]);

  // 게시글 수정 시작 핸들러
  const handleEditStart = () => {
    setIsEditing(true);
  };

  // 게시글 수정 취소 핸들러
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category || '시각장애');
    setError(null);
    
    // 이미지 초기화
    if (post.fileUrls) {
      const initialImages = Array.isArray(post.fileUrls) 
        ? post.fileUrls.map(url => ({ file_key: url, action: 'keep' }))
        : post.fileUrls ? [{ file_key: post.fileUrls, action: 'keep' }] : [];
      
      setImages(initialImages);
    } else if (post.fileUrl) {
      setImages([{ file_key: post.fileUrl, action: 'keep' }]);
    } else {
      setImages([]);
    }
  };

  // 이미지 삭제 핸들러 (API 명세서에 맞게 수정)
  const handleRemoveImage = (fileKey) => {
    if (window.confirm('이미지를 삭제하시겠습니까?')) {
      setImages(prevImages => 
        prevImages.map(img => 
          img.file_key === fileKey 
            ? { ...img, action: 'delete' } 
            : img
        )
      );
    }
  };
  
  // 이미지 추가 핸들러
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 실제로는 서버에 업로드하고 URL을 받아와야 함
      // 여기서는 임시 URL 생성
      const fileKey = `uploads/community/${Date.now()}_${file.name}`;
      const fileUrl = URL.createObjectURL(file);
      
      setImages(prevImages => [
        ...prevImages,
        { file_key: fileKey, action: 'add', tempUrl: fileUrl }
      ]);
    }
  };

  // 게시글 수정 저장 핸들러 (API 명세서에 맞게 수정)
  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError({
        title: !editTitle.trim() ? '제목은 필수 입력 항목입니다.' : null,
        content: !editContent.trim() ? '내용은 필수 입력 항목입니다.' : null
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 수정할 게시글 데이터
      const postData = {
        title: editTitle,
        content: editContent,
        category: editCategory,
        authorId: currentUser.id,
        images: images.filter(img => img.action !== 'delete')
      };
      
      await updatePost(post.id, postData);
      
      setIsEditing(false);
      setError(null);
      alert('게시글이 수정되었습니다.');
    } catch (err) {
      console.error('게시글 수정 중 오류:', err);
      
      // API 에러 응답 처리
      if (err.response && err.response.data && err.response.data.details) {
        setError(err.response.data.details);
      } else {
        setError({ general: '게시글 수정 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 게시글 삭제 핸들러 (API 명세서에 맞게 수정)
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
      await deletePost(post.id);
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      console.error('게시글 삭제 중 오류:', err);
      
      // API 에러 응답 처리
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const isAuthor = currentUser.id === post.authorId;

  return (
    <>
      {isEditing ? (
        <EditForm
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editContent={editContent}
          setEditContent={setEditContent}
          editCategory={editCategory}
          setEditCategory={setEditCategory}
          post={post}
          images={images}
          handleRemoveImage={handleRemoveImage}
          handleAddImage={handleAddImage}
          handleEditCancel={handleEditCancel}
          handleEditSave={handleEditSave}
          isSubmitting={isSubmitting}
          error={error}
        />
      ) : (
        <ViewPost
          post={post}
          isAuthor={isAuthor}
          navigate={navigate}
          handleEditStart={handleEditStart}
          handleDeletePost={handleDeletePost}
        />
      )}
    </>
  );
};

// 게시글 수정 폼 컴포넌트
const EditForm = ({
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editCategory,
  setEditCategory,
  post,
  images,
  handleRemoveImage,
  handleAddImage,
  handleEditCancel,
  handleEditSave,
  isSubmitting,
  error
}) => {
  return (
    <div className="mb-6">
      {/* 카테고리 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <select
          value={editCategory}
          onChange={e => setEditCategory(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-[#e0e7e0] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
        >
          <option value="시각장애">시각장애</option>
          <option value="구음장애">구음장애</option>
          <option value="청각장애">청각장애</option>
        </select>
      </div>
      
      {/* 제목 입력 */}
      <div className="mb-4">
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className={`w-full px-4 py-3 bg-white border ${
            error?.title ? 'border-red-500' : 'border-[#e0e7e0]'
          } rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]`}
          placeholder="제목을 입력하세요"
        />
        {error?.title && (
          <p className="mt-1 text-sm text-red-500">{error.title}</p>
        )}
      </div>
      
      {/* 내용 입력 */}
      <div className="mb-4">
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          className={`w-full h-64 px-4 py-3 bg-white border ${
            error?.content ? 'border-red-500' : 'border-[#e0e7e0]'
          } rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af] resize-none`}
          placeholder="내용을 입력하세요"
        />
        {error?.content && (
          <p className="mt-1 text-sm text-red-500">{error.content}</p>
        )}
      </div>

      {/* 첨부 이미지 표시 및 관리 */}
      <div className="mt-4 border border-[#e0e7e0] rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-700">첨부된 이미지</h4>
          <label className="cursor-pointer px-3 py-1 bg-[#8ed7af] text-white text-sm rounded-full hover:bg-[#7bc89e] transition-colors">
            이미지 추가
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
            />
          </label>
        </div>
        
        {/* 이미지 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {images.map((img, index) => (
            img.action !== 'delete' && (
              <div key={index} className="relative">
                <img
                  src={img.tempUrl || img.file_key}
                  alt={`첨부 이미지 ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.file_key)}
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
            )
          ))}
        </div>
        
        {/* 이미지가 없는 경우 메시지 표시 */}
        {images.filter(img => img.action !== 'delete').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            첨부된 이미지가 없습니다
          </div>
        )}
      </div>

      {/* 일반 오류 메시지 */}
      {error?.general && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error.general}
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleEditCancel}
          type="button"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          onClick={handleEditSave}
          type="button"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#8ed7af] text-white rounded-full hover:bg-[#7bc89e] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

// 게시글 조회 컴포넌트
const ViewPost = ({
  post,
  isAuthor,
  navigate,
  handleEditStart,
  handleDeletePost,
}) => {
  return (
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
  );
};

export default PostContent;
