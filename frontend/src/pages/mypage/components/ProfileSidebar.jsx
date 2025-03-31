import React, { useRef } from 'react';
import CertificationToggle from './CertificationToggle';

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
  const fileInputRef = useRef(null);

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // 프로필 이미지 미리보기
    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
      <div className="flex flex-col items-center">
        {/* 프로필 이미지 */}
        <div
          className="w-36 h-36 rounded-full overflow-hidden cursor-pointer relative group mb-6 border-4 border-white shadow-md"
          onClick={handleProfileImageClick}
        >
          <img
            src={profile.profile_url}
            alt="프로필 이미지"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-800 font-medium">
              사진 변경
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
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
