import React, { useState } from 'react';

const CounselorRequestModal = ({ isOpen, onClose, onSubmit, counselor }) => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // 생년월일 유효성 검사
  const validateBirthdate = value => {
    // YYYY.MM.DD 형식 검사 정규식
    const regex = /^(19|20)\d\d\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(value)) {
      return false;
    }

    // 날짜 유효성 검사
    const [year, month, day] = value.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // 생년월일 입력 형식 자동 변환 (YYYY.MM.DD)
  const handleBirthdateChange = e => {
    let value = e.target.value;

    // 숫자와 마침표만 허용
    value = value.replace(/[^\d.]/g, '');

    // 마침표 자동 추가
    if (value.length > 4 && value.charAt(4) !== '.') {
      value = value.slice(0, 4) + '.' + value.slice(4);
    }
    if (value.length > 7 && value.charAt(7) !== '.') {
      value = value.slice(0, 7) + '.' + value.slice(7);
    }

    // 최대 10자리로 제한 (YYYY.MM.DD)
    if (value.length <= 10) {
      setBirthdate(value);
    }
  };

  const handleSubmit = () => {
    // 유효성 검사
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!birthdate.trim()) {
      setError('생년월일을 입력해주세요.');
      return;
    }

    if (!validateBirthdate(birthdate)) {
      setError('올바른 생년월일 형식이 아닙니다. (예: 1990.01.01)');
      return;
    }

    setError(null);
    onSubmit({
      name,
      birthdate,
      counselor_id: counselor?.id || '',
    });
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
            {counselor?.name ? `${counselor.name} 상담사에게 ` : ''}상담 요청
          </h2>
          <p className="text-center font-bold text-gray-600 text-xs mb-4">
            입력하신 정보는 상담에만 사용됩니다.
          </p>

          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

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
                placeholder="YYYY.MM.DD 형식으로 입력해주세요..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DC0B5] focus:border-[#4DC0B5]"
                value={birthdate}
                onChange={handleBirthdateChange}
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">예시: 1990.01.01</p>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition-colors"
              onClick={onClose}
            >
              취소
            </button>
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white text-sm font-medium px-6 py-1.5 rounded-md shadow-sm transition-colors"
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
