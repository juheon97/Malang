import React, { useRef, useState, useEffect } from 'react';
import CertificationToggle from './CertificationToggle';
import axios from 'axios';

/**
 * 프로필 사이드바 컴포넌트 - 이미지와 기본 정보
 */
const ProfileSidebar = ({
  profile,
  userDetails,
  currentUser,
  onImageChange,
  onCertificationToggle,
  updatingCertification,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // 컴포넌트 마운트 시 이미지 URL 갱신
  useEffect(() => {
    refreshImageUrl();
  }, []);

  const refreshImageUrl = async () => {
    if (!currentUser?.id) return;
  
    try {
      setIsImageLoading(true);
      console.log('이미지 URL 갱신 요청 시작...');
  
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile/image-url`, {
        params: { userId: currentUser.id },
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // 응답에서 Pre-signed URL 가져오기
      if (response.data && typeof response.data === 'string') {
        const newProfileUrl = response.data;
        console.log('새로운 프로필 이미지 URL:', newProfileUrl);
  
        // 상태 업데이트
        onImageChange(newProfileUrl);
      } else {
        console.error('응답 데이터 형식이 올바르지 않습니다:', response.data);
      }
    } catch (error) {
      console.error('URL 갱신 실패:', error);
  
      // 에러 발생 시 기본 이미지로 복구
      if (!profile.profile_url) {
        onImageChange('/default-profile.png'); // 기본 이미지 경로
      }
    } finally {
      setIsImageLoading(false);
    }
  };
  
  const handleProfileImageClick = () => {
    if (isUploading || isImageLoading) return;
    fileInputRef.current.click();
  };

  const handleImageError = () => {
    console.log('이미지 로드 실패, URL 갱신 시도');
    refreshImageUrl();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      // 로딩 상태 관리
      setIsUploading(true);
      
      // 선택된 파일 정보 로깅
      console.log('선택된 파일 정보:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      });
      
      // 1. 미리보기 생성 (UI에만 사용)
      const reader = new FileReader();
      reader.onload = () => {
        // 미리보기용으로만 표시 (실제 저장에는 사용하지 않음)
        console.log('미리보기 생성 완료');
      };
      reader.readAsDataURL(file);
      
      // 2. 이미지 업로드를 위한 FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      
      // 3. API로 이미지 업로드
      const token = sessionStorage.getItem('token');
      const userId = currentUser?.id;
      
      console.log(`이미지 업로드 API 호출: ${API_URL}/profile/upload-image?userId=${userId}`);
      
      const response = await axios.post(
        `${API_URL}/profile/upload-image?userId=${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('API 응답 상태:', response.status);
      
      // 응답이 문자열인지 확인 (URL 직접 반환)
      if (typeof response.data === 'string') {
        const imageUrl = response.data;
        console.log('서버에서 반환된 이미지 URL:', imageUrl);
        
        // 프로필 상태 업데이트 - 서버에서 반환한 URL 사용
        onImageChange(imageUrl);
        console.log('프로필 이미지 URL이 성공적으로 업데이트되었습니다.');
      } else {
        console.error('서버 응답이 예상 형식이 아닙니다:', response.data);
        alert('이미지 업로드에 실패했습니다: 서버 응답 형식 오류');
      }
      
    } catch (error) {
      console.error('1MB 이상 파일은 업데이트가 불가능합니다:', error);
      
      if (error.response) {
        console.error('서버 응답:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      alert('1MB 이상 파일은 업데이트가 불가능합니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
      <div className="flex flex-col items-center">
        {/* 프로필 이미지 */}
        <div
          className={`w-36 h-36 rounded-full overflow-hidden relative group mb-6 border-4 border-white shadow-md ${(!isUploading && !isImageLoading) ? 'cursor-pointer' : ''}`}
          onClick={handleProfileImageClick}
        >
          <img
            src={profile.profile_url}
            alt="프로필 이미지"
            className={`w-full h-full object-cover ${(isUploading || isImageLoading) ? 'opacity-50' : ''}`}
            onError={handleImageError}
          />
          
          
          {(isUploading || isImageLoading) ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a173]"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-800 font-medium">
                사진 변경
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading || isImageLoading}
          />
        </div>

        {/* 사용자 이름 */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {userDetails?.name ||
            currentUser?.username ||
            currentUser?.counselor_name ||
            '상담사'}
        </h2>

        {/* 기본 정보 카드 */}
        <div className="w-full space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700">기본 정보</h3>
            </div>

            {/* 성별 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">성별</span>
                <span className="font-medium text-gray-800">
                  {(userDetails?.gender || currentUser?.gender) === 'M'
                    ? '남자'
                    : '여자'}
                </span>
              </div>

              {/* 생년월일 */}
              <div className="flex justify-between">
                <span className="text-gray-600">생년월일</span>
                <span className="font-medium text-gray-800">
                  {userDetails?.birth_date ||
                    currentUser?.birth_date ||
                    '정보 없음'}
                </span>
              </div>

              {/* 자격증 토글 */}
              <CertificationToggle
                hasCertification={profile.hasCertification}
                onToggle={onCertificationToggle}
                isUpdating={updatingCertification}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;