// src/components/community/CommunityWrite.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostStore from '../../store/postStore';

const CommunityWrite = () => {
  const navigate = useNavigate();
  const { createPost } = usePostStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('시각장애');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 파일 선택 핸들러
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // 파일 제거 핸들러
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = '제목은 필수 입력 항목입니다.';
    }
    
    if (!content.trim()) {
      newErrors.content = '내용은 필수 입력 항목입니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 현재 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
      const currentUser = {
        id: 1,
        username: '익명의 리뷰어'
      };

      // 게시글 데이터 구성
      const postData = {
        title,
        content,
        category,
        authorId: currentUser.id,
        authorName: currentUser.username,
      };
      
      // 파일이 있는 경우 URL 추가
      if (filePreview) {
        postData.fileUrl = filePreview;
      }

      const response = await createPost(postData);
      
      // 성공 메시지 표시
      alert('게시글이 성공적으로 등록되었습니다.');
      
      // 게시글 목록 페이지로 이동
      navigate('/community');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      
      // 에러 메시지 표시
      if (error.response && error.response.data && error.response.data.details) {
        setErrors(error.response.data.details);
      } else {
        alert('게시글 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-[#f5fdf5] to-[#e6f7f0] rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-[#00a173] mb-8">
        커뮤니티
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 카테고리 선택 */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="px-4 py-2 bg-[#8ed7af] text-white rounded-full shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
          >
            카테고리
          </button>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-[#e0e7e0] rounded-full text-sm font-medium shadow-md appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]"
            >
              <option value="시각장애">시각장애</option>
              <option value="구음장애">구음장애</option>
              <option value="청각장애">청각장애</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 제목 입력 */}
        <div>
          <input
            type="text"
            placeholder="제목을 입력해주세요."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full px-4 py-3 bg-white border ${
              errors.title ? 'border-red-500' : 'border-[#e0e7e0]'
            } rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af]`}
          />
          {errors.title && (
            <p className="mt-1 text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        {/* 내용 입력 */}
        <div>
          <textarea
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={e => setContent(e.target.value)}
            className={`w-full h-64 px-4 py-3 bg-white border ${
              errors.content ? 'border-red-500' : 'border-[#e0e7e0]'
            } rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8ed7af] resize-none`}
          />
          {errors.content && (
            <p className="mt-1 text-red-500 text-sm">{errors.content}</p>
          )}
        </div>

        {/* 파일 업로드 영역 */}
        <div className="bg-white p-4 border border-[#e0e7e0] rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              이미지 첨부
            </label>
            {filePreview && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-sm text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            )}
          </div>

          {filePreview ? (
            <div className="mb-3">
              <img
                src={filePreview}
                alt="미리보기"
                className="max-h-40 rounded-lg mx-auto"
              />
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer mb-3"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-500">
                클릭하여 이미지를 업로드하세요
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, GIF 파일 (최대 10MB)
              </p>
            </div>
          )}

          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="text-xs text-gray-500">
            * 이미지는 게시글 내용에 표시됩니다.
          </div>
        </div>

        {/* 등록하기 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-[#8ed7af] text-white rounded-full shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityWrite;
