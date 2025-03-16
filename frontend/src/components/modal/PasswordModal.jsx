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
      
      <div className="relative max-w-xl w-full overflow-hidden">
        {/* 상단 초록색 바 */}
        <div className="w-full h-3 bg-green-500"></div>
        
        <div className="bg-white rounded-b-sm shadow-xl p-6 z-10">
          <h2 className="text-xl font-bold text-center mb-6">비밀번호를 입력해주세요</h2>
          
          <div className="mb-6">
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4DC0B5] focus:border-transparent"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center">
            <button
              className="bg-[#f2f2f2] hover:bg-gradient-to-r hover:from-[#79E7B7] hover:to-[#08976E] hover:text-white text-black font-medium px-8 py-2 rounded-lg shadow-md transition-colors"
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