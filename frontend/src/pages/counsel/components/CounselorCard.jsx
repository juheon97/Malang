import React, { useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';

/**
 * 일반 모드에서 사용되는 상담사 카드 컴포넌트
 */
const CounselorCard = ({
  counselor,
  onReviewClick,
  onBioClick,
  onRequestClick,
}) => {
  // counselor.id는 이미 정수형으로 처리되어 있음 (API 호출 시 변환)

  const { currentUser } = useAuth();

  const isCounselor = currentUser && currentUser.role == 'ROLE_COUNSELOR';

  // status 값이 1이면 상담 가능, 0이면 불가능
  const [isAvailable, setIsAvailable] = useState(
    counselor.status === 1 || counselor.status === '가능',
  );

  // 초기 상태 설정 (props 값 변경 시 상태 업데이트)
  useEffect(() => {
    // props 값만 사용하여 상태 설정
    const available = counselor.status === 1 || counselor.status === '가능';
    setIsAvailable(available);
    console.log(
      `상담사 ID: ${counselor.id}, status: ${counselor.status}, 가능 여부: ${available}`,
    );
  }, [counselor.status]);

  // 상담 요청 버튼 클릭 핸들러
  const handleRequestClick = () => {
    if (!counselor.counselorCode) {
      console.error('상담사 코드가 없습니다.');
      return;
    }
    onRequestClick(counselor.counselorCode, counselor);
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-100 hover:-translate-y-1"
      style={{
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* 상담사 프로필 상단 */}
      <div
        className="relative p-5 text-center"
        style={{
          background: `linear-gradient(135deg,rgb(173, 237, 209) 0%,rgb(40, 154, 122) 100%)`,
          boxShadow: '0 4px 6px -1px rgba(8, 151, 110, 0.2)',
        }}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

        <div className="relative mx-auto w-20 h-20 mb-2">
          {/* 흰색 원 배경 */}
          <div className="absolute inset-0 bg-white rounded-full opacity-90 transform scale-110"></div>

          {/* 실제 프로필 이미지 */}
          <div
            className="relative mx-auto w-20 h-20 rounded-full shadow-lg overflow-hidden"
            style={{
              background: counselor.profile_url ? 'transparent' : `#f9d3c0`,
              boxShadow:
                '0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(245, 242, 242, 0.5)',
            }}
          >
            {counselor.profile_url ? (
              <img
                src={counselor.profile_url}
                alt={`${counselor.name} 프로필`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 shadow-inner rounded-full"></div>
            )}
          </div>
        </div>

        <h2
          style={{
            fontFamily: "'HancomMalangMalang-Regular', sans-serif",
          }}
          className="text-white text-lg font-bold drop-shadow-md"
        >
          {counselor.name}
        </h2>
        <p className="text-green-50 text-sm mb-2">{counselor.title}</p>

        <div className="flex justify-center mt-2 space-x-3">
          <div
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
            style={{
              boxShadow:
                '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            <p className="text-white text-sm font-bold">
              {counselor.satisfaction}
            </p>
            <p className="text-green-50 text-xs">만족도</p>
          </div>
          <div
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
            style={{
              boxShadow:
                '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            <p className="text-white text-sm font-bold">
              {counselor.personalHistory}
            </p>
            <p className="text-green-50 text-xs">상담 경력</p>
          </div>
        </div>
      </div>

      {/* 상담사 정보 하단 */}
      <div className="p-4 flex flex-col justify-between" style={{ minHeight: '180px' }}>
        <div>
          <div className="mb-1">
            {/* 자격증 정보 표시 */}
            {counselor.hasCertification ? (
              <div className="flex items-center text-green-500">
                <svg
                  className="w-5 h-5 mr-1 filter drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="text-sm font-medium">상담 자격증 보유</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">상담 자격증 미보유</span>
            )}
          </div>

          {/* 상담사 소개 */}
          <div className="mb-4">
            <h3 className="font-bold mb-1 text-gray-800">상담사 소개</h3>
            <p className="text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis mb-1">
              {counselor.bio}
            </p>
            <button
              className="text-xs text-green-600 hover:underline mb-0"
              onClick={e => {
                e.stopPropagation();
                onBioClick(counselor);
              }}
            >
              더보기
            </button>
          </div>
        </div>

        {/* 상담 요청 버튼 - 상담사 역할이 아닐 때만 표시 */}
        {!isCounselor && (
          <button
            className="w-1/2 mx-auto block text-white py-2 rounded-full font-medium transition duration-200 transform hover:scale-105"
            style={{
              background: isAvailable
                ? 'linear-gradient(to right,rgb(99, 223, 172),rgb(64, 188, 124))'
                : 'linear-gradient(to right, #9CA3AF, #6B7280)',
              boxShadow: isAvailable
                ? '0 4px 6px -1px rgba(8, 151, 110, 0.3), 0 2px 4px -1px rgba(8, 151, 110, 0.1)'
                : '0 4px 6px -1px rgba(107, 114, 128, 0.3), 0 2px 4px -1px rgba(107, 114, 128, 0.1)',
            }}
            onClick={handleRequestClick}
            disabled={!isAvailable}
          >
            {isAvailable ? '상담 요청' : '상담 불가'}
          </button>
        )}
      </div>
    </div>
  );
};
export default CounselorCard;