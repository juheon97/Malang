import React from 'react';

const WaitingModal = ({
  isOpen,
  onCancel,
  title = '수락을 기다려주세요...',
  waitingFor = '방장',
  // waitingFor = "상담사님님",
  message = '잠시만 기다려주세요. 곧 연결됩니다.',
  cancelButtonText = '취소',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative w-80 sm:w-96 overflow-hidden rounded-lg">
        {/* 상단 초록색 바 */}
        <div className="w-full h-2 bg-green-500"></div>

        <div className="bg-white rounded-b-lg shadow-xl p-5 z-10">
          <h2 className="text-lg font-bold text-center mb-4">
            {waitingFor}의 {title}
          </h2>

          {/* 로딩 애니메이션 - 세 개의 움직이는 원 */}
          <div className="flex justify-center items-center space-x-3 mb-5">
            <div
              className="w-5 h-5 bg-[#E0F7E7] rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-5 h-5 bg-[#B0EBC4] rounded-full animate-bounce"
              style={{ animationDelay: '200ms' }}
            ></div>
            <div
              className="w-5 h-5 bg-[#79E7B7] rounded-full animate-bounce"
              style={{ animationDelay: '400ms' }}
            ></div>
          </div>

          <div className="text-center text-gray-500 text-sm mb-5">
            {message}
          </div>

          <div className="flex justify-center">
            <button
              className="bg-[#f2f2f2] hover:bg-gray-200 text-black text-sm font-medium px-6 py-1.5 rounded-md shadow-sm transition-colors"
              onClick={onCancel}
            >
              {cancelButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingModal;
