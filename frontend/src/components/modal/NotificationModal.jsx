// src/components/modal/NotificationModal.jsx
import React from 'react';

const NotificationModal = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '확인',
  onButtonClick,
  type = 'info', // 'info', 'warning', 'error' 등의 타입
}) => {
  if (!isOpen) return null;

  // 타입에 따른 스타일 설정
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: (
            <svg
              className="w-12 h-12 text-yellow-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
        };
      case 'error':
        return {
          icon: (
            <svg
              className="w-12 h-12 text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          buttonColor: 'bg-red-500 hover:bg-red-600',
        };
      case 'success':
        return {
          icon: (
            <svg
              className="w-12 h-12 text-green-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
          buttonColor: 'bg-green-500 hover:bg-green-600',
        };
      case 'info':
      default:
        return {
          icon: (
            <svg
              className="w-12 h-12 text-blue-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          buttonColor: 'bg-blue-500 hover:bg-blue-600',
        };
    }
  };

  const typeStyles = getTypeStyles();

  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-md mx-auto">
        <div
          className={`${typeStyles.bgColor} rounded-lg shadow-lg p-6 border ${typeStyles.borderColor} text-center animate-fadeIn`}
        >
          <div className="flex justify-center">{typeStyles.icon}</div>

          <h3 className="text-lg font-bold mb-2">{title}</h3>

          {message && <p className="text-gray-600 mb-6">{message}</p>}

          <button
            className={`${typeStyles.buttonColor} text-white font-medium py-2 px-6 rounded-lg transition-colors`}
            onClick={handleButtonClick}
          >
            {buttonText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;
