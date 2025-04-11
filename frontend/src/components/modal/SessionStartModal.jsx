import React from 'react';

const SessionStartModal = ({
  isOpen,
  title = '상담이 시작되었습니다.',
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative w-80 sm:w-96 bg-white rounded-xl shadow-lg p-6 z-10 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <button
          onClick={onConfirm}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SessionStartModal;
