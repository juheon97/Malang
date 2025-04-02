// CounselorRequestModal.jsx
import React, { useState, useEffect } from 'react';

const CounselorRequestModal = ({ isOpen, onClose, onSubmit, counselor }) => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // counselorCode 상태 추가
  const [counselorCode, setCounselorCode] = useState(null);

  // 모달이 열릴 때마다 상담사 정보를 콘솔에 출력
  useEffect(() => {
    if (isOpen && counselor) {
      console.log('===== 상담 요청 모달 디버깅 =====');
      console.log('1. 전체 상담사 객체:', counselor);

      // counselor가 객체인 경우와 숫자인 경우를 모두 처리
      let code = null;

      if (typeof counselor === 'object') {
        // counselor가 객체인 경우 counselorCode 또는 counselor_code 속성 확인
        console.log('2. 상담사 코드(counselorCode):', counselor.counselorCode);
        console.log(
          '3. 상담사 코드(counselor_code):',
          counselor.counselor_code,
        );
        code = counselor.counselorCode || counselor.counselor_code;
      } else if (typeof counselor === 'number') {
        // counselor가 숫자인 경우 해당 숫자를 상담사 ID로 간주하고 counselorCode로 변환
        console.log('2. 상담사 코드(counselorCode): undefined');
        console.log('3. 상담사 코드(counselor_code): undefined');
        code = typeof counselor === 'number' ? counselor : null;
      }

      // 세션 스토리지에 저장된 정보 확인
      const currentChannel = JSON.parse(
        sessionStorage.getItem('currentChannel') || '{}',
      );
      console.log('4. 세션 스토리지에 저장된 채널 정보:', currentChannel);

      if (currentChannel && currentChannel.counselorCode) {
        console.log(
          '5. 세션에 저장된 상담사 코드:',
          currentChannel.counselorCode,
        );
        // 세션 스토리지에 있는 counselorCode를 우선 사용
        if (!code) {
          code = currentChannel.counselorCode;
        }
      }

      // 최종적으로 사용할 counselorCode 결정 (counselor에서 가져온 코드 우선 사용)
      const finalCounselorCode = code;
      setCounselorCode(finalCounselorCode);

      console.log(
        '6. 현재 입장하려는 방의 counselorCode:',
        finalCounselorCode || '상담사 코드를 찾을 수 없음',
      );

      // 상담사 코드가 없는 경우 경고
      if (!finalCounselorCode) {
        console.warn(
          '⚠️ 주의: 상담사 객체에 counselorCode 또는 counselor_code 속성이 없습니다!',
        );
      }

      console.log('===============================');
    }
  }, [isOpen, counselor]);

  if (!isOpen) return null;

  // 생년월일 유효성 검사
  const validateBirthdate = value => {
    const regex = /^(19|20)\d\d\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(value)) {
      return false;
    }

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
    value = value.replace(/[^\d.]/g, '');
    if (value.length > 4 && value.charAt(4) !== '.') {
      value = value.slice(0, 4) + '.' + value.slice(4);
    }
    if (value.length > 7 && value.charAt(7) !== '.') {
      value = value.slice(0, 7) + '.' + value.slice(7);
    }
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

    // 상담사 코드 확인 - 여러 출처에서 시도
    let finalCounselorCode = counselorCode;

    // 코드가 없으면 session storage에서 다시 한번 확인
    if (!finalCounselorCode) {
      const currentChannel = JSON.parse(
        sessionStorage.getItem('currentChannel') || '{}',
      );
      finalCounselorCode = currentChannel.counselorCode;
    }

    console.log('입장 요청 처리 - 사용할 상담사 코드:', finalCounselorCode);

    if (!finalCounselorCode) {
      console.error('상담사 코드를 찾을 수 없음:', counselor);
      setError('상담사 정보가 올바르지 않습니다.');
      return;
    }

    setError(null);

    // 상담사 코드를 사용하여 제출
    onSubmit({
      name,
      birthdate,
      counselor_code: finalCounselorCode,
    });

    setName('');
    setBirthdate('');
  };

  // 상담사 이름 표시 처리
  const counselorName =
    typeof counselor === 'object' && counselor.name ? counselor.name : '';

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
            {counselorName ? `${counselorName}에게 ` : ''}상담 요청
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
// import React, { useState } from 'react';

// const CounselorRequestModal = ({ isOpen, onClose, onSubmit, counselor }) => {
//   const [name, setName] = useState('');
//   const [birthdate, setBirthdate] = useState('');
//   const [error, setError] = useState(null);

//   if (!isOpen) return null;

//   // 생년월일 유효성 검사
//   const validateBirthdate = value => {
//     // YYYY.MM.DD 형식 검사 정규식
//     const regex = /^(19|20)\d\d\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])$/;
//     if (!regex.test(value)) {
//       return false;
//     }

//     // 날짜 유효성 검사
//     const [year, month, day] = value.split('.').map(Number);
//     const date = new Date(year, month - 1, day);
//     return (
//       date.getFullYear() === year &&
//       date.getMonth() === month - 1 &&
//       date.getDate() === day
//     );
//   };

//   // 생년월일 입력 형식 자동 변환 (YYYY.MM.DD)
//   const handleBirthdateChange = e => {
//     let value = e.target.value;

//     // 숫자와 마침표만 허용
//     value = value.replace(/[^\d.]/g, '');

//     // 마침표 자동 추가
//     if (value.length > 4 && value.charAt(4) !== '.') {
//       value = value.slice(0, 4) + '.' + value.slice(4);
//     }
//     if (value.length > 7 && value.charAt(7) !== '.') {
//       value = value.slice(0, 7) + '.' + value.slice(7);
//     }

//     // 최대 10자리로 제한 (YYYY.MM.DD)
//     if (value.length <= 10) {
//       setBirthdate(value);
//     }
//   };

//   const handleSubmit = () => {
//     // 유효성 검사
//     if (!name.trim()) {
//       setError('이름을 입력해주세요.');
//       return;
//     }

//     if (!birthdate.trim()) {
//       setError('생년월일을 입력해주세요.');
//       return;
//     }

//     if (!validateBirthdate(birthdate)) {
//       setError('올바른 생년월일 형식이 아닙니다. (예: 1990.01.01)');
//       return;
//     }

//     setError(null);
//     onSubmit({
//       name,
//       birthdate,
//       counselor_id: counselor?.id || '',
//     });
//     setName('');
//     setBirthdate('');
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* 배경 오버레이 */}
//       <div
//         className="absolute inset-0 bg-black bg-opacity-50"
//         onClick={onClose}
//       ></div>

//       <div className="relative w-80 sm:w-96 overflow-hidden rounded-md">
//         {/* 상단 초록색 바 */}
//         <div className="w-full h-2 bg-green-500"></div>

//         <div className="bg-white rounded-b-md shadow-xl p-5 z-10">
//           <h2 className="text-md font-bold text-center mb-3">
//             {counselor?.name ? `${counselor.name}에게 ` : ''}상담 요청
//           </h2>
//           <p className="text-center font-bold text-gray-600 text-xs mb-4">
//             입력하신 정보는 상담에만 사용됩니다.
//           </p>

//           {error && (
//             <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
//               {error}
//             </div>
//           )}

//           <div className="mb-5">
//             <div className="mb-3">
//               <label className="block text-gray-700 text-sm font-medium mb-1">
//                 이름
//               </label>
//               <input
//                 type="text"
//                 placeholder="이름을 입력해주세요..."
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DC0B5] focus:border-[#4DC0B5]"
//                 value={name}
//                 onChange={e => setName(e.target.value)}
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 text-sm font-medium mb-1">
//                 생년월일
//               </label>
//               <input
//                 type="text"
//                 placeholder="YYYY.MM.DD 형식으로 입력해주세요..."
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DC0B5] focus:border-[#4DC0B5]"
//                 value={birthdate}
//                 onChange={handleBirthdateChange}
//                 maxLength={10}
//               />
//               <p className="text-xs text-gray-500 mt-1">예시: 1990.01.01</p>
//             </div>
//           </div>

//           <div className="flex justify-center space-x-3">
//             <button
//               className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition-colors"
//               onClick={onClose}
//             >
//               취소
//             </button>
//             <button
//               className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white text-sm font-medium px-6 py-1.5 rounded-md shadow-sm transition-colors"
//               onClick={handleSubmit}
//             >
//               입장 요청
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CounselorRequestModal;
