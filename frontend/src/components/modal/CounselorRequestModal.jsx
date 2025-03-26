import React, { useState } from 'react';

const CounselorRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ name, birthdate });
    setName('');
    setBirthdate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative w-80 sm:w-96 overflow-hidden rounded-md">
        {/* 상단 초록색 바 */}
        <div className="w-full h-2 bg-green-500"></div>

        <div className="bg-white rounded-b-md shadow-xl p-5 z-10">
          <h2 className="text-md font-bold text-center mb-3">
            상담 요청을 위해 귀하의 정보를 입력해주세요
          </h2>
          <p className="text-center font-bold text-gray-600 text-xs mb-4">
            입력하신 정보는 상담에만 사용됩니다.
          </p>

          <div className="mb-5">
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                이름
              </label>
              <input
                type="text"
                placeholder="이름을 입력해주세요..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DC0B5] focus:border-[#4DC0B5]"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                생년월일
              </label>
              <input
                type="text"
                placeholder="생년월일을 입력해주세요..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DC0B5] focus:border-[#4DC0B5]"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white text-sm text-black font-medium px-6 py-1.5 rounded-md shadow-sm transition-colors"
              onClick={handleSubmit}
            >
              입장 요청
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorRequestModal;
