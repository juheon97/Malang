// video/VoiceVideoControls.jsx
import React from 'react';

const VoiceVideoControls = ({
  isMicOn,
  isCameraOn,
  toggleMic,
  toggleCamera,
  leaveSession,
  isVoiceTranslationOn = false,
  isSignLanguageOn = false,
  toggleVoiceTranslation,
  toggleSignLanguage,
  onLeaveChannel, // 새로운 prop 추가
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-2 flex items-center justify-between">
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

        <div className="flex space-x-4 items-center">
          {/* 음성번역 토글 버튼 */}
          <button
            onClick={toggleVoiceTranslation}
            className="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
          >
            <span className="mr-2">음성 번역</span>
            <span
              className={
                isVoiceTranslationOn ? 'text-red-400' : 'text-green-500'
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
              className={isSignLanguageOn ? 'text-red-400' : 'text-green-500'}
            >
              {isSignLanguageOn ? '중단' : '시작'}
            </span>
          </button>

          {/* 나가기 버튼 */}
          {/* 나가기 버튼 */}
<button
  onClick={() => {
    // 버튼 중복 클릭 방지
    const button = event.currentTarget;
    button.disabled = true;
    
    console.log('화상 채팅방 나가기 버튼 클릭');
    
    // 콜백 함수가 있으면 호출, 아니면 기본 동작 수행
    if (typeof onLeaveChannel === 'function') {
      onLeaveChannel();
    } else if (typeof leaveSession === 'function') {
      leaveSession();
      window.location.href = '/counsel-channel';
    }
    
    // 0.5초 후 버튼 다시 활성화 (실수로 여러번 클릭해도 문제 없도록)
    setTimeout(() => {
      button.disabled = false;
    }, 500);
  }}
  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-red-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
</button>
        </div>
      </div>
    </div>
  );
};

export default VoiceVideoControls;
