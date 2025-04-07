import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useProfileData from './hooks/useProfileData';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileForm from './components/ProfileForm';
import ProfileAlert from './components/ProfileAlert';
import CounselingHistoryList from './components/CounselingHistoryList';


/**
 * 마이페이지 메인 컴포넌트
 */
const MyPage = () => {
  const { currentUser } = useAuth() || {};
  const [activeTab, setActiveTab] = useState('profile');

  // 커스텀 훅 사용
  const {
    profile,
    userDetails,
    loading,
    error,
    success,
    isInitialLoading,
    updatingCertification,
    isCounselor,
    updateCertification,
    handleInputChange,
    updateProfileImage,
    saveProfile,
  } = useProfileData(currentUser);

  // 초기 로딩 상태인 경우 로딩 화면 표시
  if (isInitialLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 mt-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 현재 사용자가 상담사가 아니면 권한 없음 메시지 표시
  if (currentUser && !isCounselor()) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 mt-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-yellow-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-yellow-700 font-medium">
              상담사 계정만 이 페이지에 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 현재 사용자가 없으면 로딩 표시
  if (!currentUser) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">마이페이지</h1>
        <p className="text-gray-600">
          정보를 관리하고 프로필을 업데이트하세요.
        </p>
      </div>

      {/* 알림 메시지 */}
      <ProfileAlert error={error} success={success} />

      {/* 탭 네비게이션 */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'profile'
              ? 'text-[#00a173] border-b-2 border-[#00a173]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          프로필 정보
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'counseling-history'
              ? 'text-[#00a173] border-b-2 border-[#00a173]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('counseling-history')}
        >
          상담 기록
        </button>
      </div>

      {/* 프로필 정보 탭 */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* 왼쪽 사이드바 - 이미지와 기본 정보 */}
            <ProfileSidebar
              profile={profile}
              userDetails={userDetails}
              currentUser={currentUser}
              onImageChange={updateProfileImage}
              onCertificationToggle={updateCertification}
              updatingCertification={updatingCertification}
            />

            {/* 오른쪽 메인 컨텐츠 - 상담 정보 */}
            <ProfileForm
              profile={profile}
              onChange={handleInputChange}
              onSubmit={saveProfile}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* 상담 기록 탭 */}
      {activeTab === 'counseling-history' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CounselingHistoryList counselorId={currentUser?.id} />
        </div>
      )}
    </div>
  );
};

export default MyPage;