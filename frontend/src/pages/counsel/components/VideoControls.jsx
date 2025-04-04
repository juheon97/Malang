import React, { useState, useEffect } from 'react';

const VideoControls = ({
  isMicOn,
  isCameraOn,
  toggleMic,
  toggleCamera,
  leaveSession,
  isVoiceTranslationOn = false,
  isSignLanguageOn = false,
  toggleVoiceTranslation,
  toggleSignLanguage,
  onStartSession,
  onEndSession,
  isSessionStarted = false,
  isPageMoveActive = false, // 외부 이벤트에 따른 활성화 여부
}) => {
  // 로컬 상태로 세션 시작 여부 관리
  const [localSessionStarted, setLocalSessionStarted] =
    useState(isSessionStarted);

  // 부모 컴포넌트에서 isSessionStarted 값이 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setLocalSessionStarted(isSessionStarted);
  }, [isSessionStarted]);

  // 버튼 클릭 핸들러 - 로컬 상태 즉시 업데이트 + 부모 함수 호출
  const handleStartSession = () => {
    console.log('상담 시작 버튼 클릭됨');
    setLocalSessionStarted(true); // 로컬 상태 즉시 변경
    if (typeof onStartSession === 'function') {
      onStartSession();
    } else {
      console.error('onStartSession is not a function');
    }
  };

  const handleEndSession = () => {
    console.log('상담 종료 버튼 클릭됨');
    setLocalSessionStarted(false); // 로컬 상태 즉시 변경
    if (typeof onEndSession === 'function') {
      onEndSession();
    } else {
      console.error('onEndSession is not a function');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-2 flex items-center justify-between">
        {/* 왼쪽 기본 컨트롤 */}
        <div className="flex space-x-4">
          {/* 마이크 버튼 */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              isMicOn ? 'bg-[#E8F5E9]' : 'bg-red-100'
            } hover:opacity-80`}
          >
            {isMicOn ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            )}
          </button>

          {/* 카메라 버튼 */}
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 flex items-center justify-center rounded-full ${
              isCameraOn ? 'bg-[#E8F5E9]' : 'bg-red-100'
            } hover:opacity-80`}
          >
            {isCameraOn ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-45"></div>
              </div>
            )}
          </button>
        </div>

        {/* 오른쪽 컨트롤: 음성 번역, 수화 번역, 상담 시작 버튼 */}
        <div className="flex space-x-4 items-center">
          {/* 음성번역 토글 버튼 */}
          <button
            onClick={toggleVoiceTranslation}
            className="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          >
            <span className="mr-2">음성 번역</span>
            <span
              className={
                isVoiceTranslationOn ? 'text-green-500' : 'text-red-400'
              }
            >
              {isVoiceTranslationOn ? '중단' : '시작'}
            </span>
          </button>

          {/* 수화번역 토글 버튼 */}
          <button
            onClick={toggleSignLanguage}
            className="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          >
            <span className="mr-2">수화 번역</span>
            <span
              className={isSignLanguageOn ? 'text-green-500' : 'text-red-400'}
            >
              {isSignLanguageOn ? '중단' : '시작'}
            </span>
          </button>

          {/* 상담 시작 버튼 (기능 없음) */}
          <button
            type="button"
            onClick={handleStartSession}
            disabled={!isPageMoveActive} // isPageMoveActive가 false이면 비활성화
            className={`px-4 py-2 font-medium rounded-lg shadow-md transition-all cursor-pointer z-10 ${
              isPageMoveActive
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>상담 시작</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoControls);
