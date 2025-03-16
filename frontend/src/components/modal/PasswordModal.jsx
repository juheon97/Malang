import React from 'react';

const PasswordModal = ({ 
  isOpen, 
  onClose, 
  passwordInput, 
  setPasswordInput, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      <div className="relative w-80 sm:w-96 overflow-hidden rounded-lg">
        {/* 상단 초록색 바 */}
        <div className="w-full h-2 bg-green-500"></div>
        
        <div className="bg-white rounded-b-lg shadow-xl p-5 z-10">
          <h2 className="text-lg font-bold text-center mb-4">비밀번호를 입력해주세요</h2>
          
          <div className="mb-5">
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DC0B5] focus:border-[#4DC0B5]"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center">
            <button
              className="bg-[#f2f2f2] hover:bg-gradient-to-r hover:from-[#79E7B7] hover:to-[#08976E] hover:text-white text-black text-sm font-medium px-6 py-1.5 rounded-md shadow-sm transition-colors"
              onClick={onSubmit}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;