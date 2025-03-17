// import React, { useState } from 'react';
// import ReviewModal from '../../components/modal/ReviewModal';
// import CounselorRequestModal from '../../components/modal/CounselorRequestModal';
// import WaitingModal from '../../components/modal/WaitingModal';

// const Counsel = () => {
//   const [selectedCounselor, setSelectedCounselor] = useState(null);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [showRequestModal, setShowRequestModal] = useState(false);
//   const [showWaitingModal, setShowWaitingModal] = useState(false);

//   // 리뷰 모달 열기
//   const openReviewModal = counselor => {
//     setSelectedCounselor(counselor);
//     setShowReviewModal(true);
//     document.body.style.overflow = 'hidden';
//   };

//   // 상담 요청 모달 열기
//   const openRequestModal = counselor => {
//     setSelectedCounselor(counselor);
//     setShowRequestModal(true);
//     document.body.style.overflow = 'hidden';
//   };

//   // 상담 요청 제출 처리
//   const handleRequestSubmit = userInfo => {
//     console.log('상담 요청:', userInfo, '상담사:', selectedCounselor?.name);
//     setShowRequestModal(false);
//     setShowWaitingModal(true); // 대기 모달 표시
//   };

//   // 대기 취소
//   const handleCancelWaiting = () => {
//     setShowWaitingModal(false);
//     document.body.style.overflow = 'unset';
//     console.log('상담 요청 취소');
//   };

//   // 모달 닫기
//   const closeModal = () => {
//     setShowReviewModal(false);
//     setShowRequestModal(false);
//     setShowWaitingModal(false);
//     document.body.style.overflow = 'unset';
//   };

//   // 상담사 더미
//   const counselors = [
//     {
//       id: 1,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: true,
//     },
//     {
//       id: 2,
//       name: '해빈 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '40년',
//       isAvailable: true,
//     },
//     {
//       id: 3,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: true,
//     },
//     {
//       id: 4,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: true,
//     },
//     {
//       id: 5,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: false,
//     },
//     {
//       id: 6,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: false,
//     },
//     {
//       id: 7,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: false,
//     },
//     {
//       id: 8,
//       name: '다혜 상담사',
//       title: '심리 상담 전문가',
//       satisfaction: '98%',
//       personalHistory: '5년',
//       isAvailable: false,
//     },
//   ];

//   const pageStyle = {
//     backgroundImage: `
//       radial-gradient(circle at 5% -2%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 4%),
//       radial-gradient(circle at 0% 4%, rgba(233, 230, 47, 0.16) 0%, rgba(255, 255, 255, 0) 5%),
//       radial-gradient(circle at 80% 3%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
//       radial-gradient(circle at 6% 95%, rgba(249, 200, 255, 0.52) 0%, rgba(255, 255, 255, 0) 20%)
//     `,
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
//       <div
//         className="max-w-7xl mx-auto p-6 mt-6 bg-white rounded-3xl shadow-2xl relative overflow-hidden"
//         style={pageStyle}
//       >
//         <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-50 rounded-full -ml-48 -mb-48 opacity-20"></div>

//         {/* 제목 */}
//         <div className="flex items-center mb-6 relative z-10">
//           <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full shadow-md"></div>
//           <h1
//             style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
//             className="text-2xl font-bold text-gray-800 relative"
//           >
//             상담사 찾기
//           </h1>
//         </div>

//         {/* 상담사 카드 그리드 */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
//           {counselors.map(counselor => (
//             <div
//               key={counselor.id}
//               className="bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
//               style={{
//                 boxShadow:
//                   '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
//               }}
//             >
//               {/* 상담사 프로필 상단 */}
//               <div
//                 className="relative p-5 text-center"
//                 style={{
//                   background: `linear-gradient(135deg, #79E7B7 0%, #08976E 100%)`,
//                   boxShadow: '0 4px 6px -1px rgba(8, 151, 110, 0.2)',
//                 }}
//               >
//                 <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
//                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

//                 {/* 프로필 이미지 */}
//                 <div
//                   className="relative mx-auto w-20 h-20 mb-2 rounded-full shadow-lg overflow-hidden"
//                   style={{
//                     background: `#f9d3c0`,
//                     boxShadow:
//                       '0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(245, 242, 242, 0.5)',
//                   }}
//                 >
//                   <div className="absolute inset-0 shadow-inner rounded-full"></div>
//                 </div>

//                 <h2
//                   style={{
//                     fontFamily: "'HancomMalangMalang-Regular', sans-serif",
//                   }}
//                   className="text-white text-lg font-bold drop-shadow-md"
//                 >
//                   {counselor.name}
//                 </h2>
//                 <p className="text-green-50 text-sm mb-2">{counselor.title}</p>

//                 <div className="flex justify-center mt-2 space-x-3">
//                   <div
//                     className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
//                     style={{
//                       boxShadow:
//                         '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
//                     }}
//                   >
//                     <p className="text-white text-sm font-bold">
//                       {counselor.satisfaction}
//                     </p>
//                     <p className="text-green-50 text-xs">만족도</p>
//                   </div>
//                   <div
//                     className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
//                     style={{
//                       boxShadow:
//                         '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
//                     }}
//                   >
//                     <p className="text-white text-sm font-bold">
//                       {counselor.personalHistory}
//                     </p>
//                     <p className="text-green-50 text-xs">상담 경력</p>
//                   </div>
//                 </div>
//               </div>

//               {/* 상담사 정보 하단 */}
//               <div className="p-4">
//                 <div className="mb-2">
//                   {counselor.isAvailable ? (
//                     <div className="flex items-center text-green-500">
//                       <svg
//                         className="w-5 h-5 mr-1 filter drop-shadow-sm"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M5 13l4 4L19 7"
//                         ></path>
//                       </svg>
//                       <span className="text-sm font-medium">
//                         상담 자격증 보유
//                       </span>
//                     </div>
//                   ) : (
//                     <span className="text-sm text-gray-500">
//                       상담 자격증 보유
//                     </span>
//                   )}
//                 </div>

//                 <h3 className="font-bold mb-1 text-gray-800">상담사 소개</h3>
//                 <p className="text-sm text-gray-600 mb-3 leading-relaxed">
//                   저한테 상담받으세요~
//                 </p>

//                 {/* 리뷰뷰 */}
//                 <div
//                   className="flex items-center mb-3 cursor-pointer group"
//                   onClick={() => openReviewModal(counselor)}
//                 >
//                   <span className="text-sm font-medium mr-2 group-hover:text-green-500 transition-colors">
//                     리뷰 20+
//                   </span>
//                   <div className="flex">
//                     {[1, 2, 3, 4, 5].map(star => (
//                       <svg
//                         key={star}
//                         className="w-4 h-4 text-yellow-400 filter drop-shadow-sm"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
//                       </svg>
//                     ))}
//                   </div>
//                   {/* 리뷰 더보기 */}
//                   <svg
//                     className="w-4 h-4 ml-1 text-gray-400 group-hover:text-green-500 transition-colors"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M9 5l7 7-7 7"
//                     ></path>
//                   </svg>
//                 </div>

//                 <div
//                   className="p-3 rounded-lg mb-3 relative overflow-hidden"
//                   style={{
//                     background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
//                     boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
//                   }}
//                 >
//                   <div className="absolute top-0 right-0 w-16 h-16 bg-gray-200 opacity-30 rounded-full -mr-8 -mt-8"></div>
//                   <p className="text-sm text-gray-600 relative z-10">
//                     어떤 상담 받으시나요? 궁금...
//                   </p>
//                 </div>

//                 <div className="border-t border-gray-100 pt-3 mb-3">
//                   <div className="flex items-center justify-center">
//                     <div className="flex items-center text-green-500">
//                       <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-sm"></span>
//                       <span className="text-sm">
//                         현재 상담 가능 상태입니다.
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* 상담 요청청 */}
//                 <button
//                   className="w-1/2 mx-auto block text-white py-2 rounded-full font-medium transition duration-200 transform hover:scale-105"
//                   style={{
//                     background: 'linear-gradient(to right, #79E7B7, #08976E)',
//                     boxShadow:
//                       '0 4px 6px -1px rgba(8, 151, 110, 0.3), 0 2px 4px -1px rgba(8, 151, 110, 0.1)',
//                   }}
//                   onClick={() => openRequestModal(counselor)}
//                 >
//                   상담 요청
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 리뷰 모달 */}
//       {showReviewModal && selectedCounselor && (
//         <ReviewModal counselor={selectedCounselor} onClose={closeModal} />
//       )}

//       {/* 상담 요청 모달 */}
//       {showRequestModal && selectedCounselor && (
//         <CounselorRequestModal
//           isOpen={showRequestModal}
//           onClose={closeModal}
//           onSubmit={handleRequestSubmit}
//         />
//       )}

//       {/* 상담사 대기 모달 */}
//       {showWaitingModal && selectedCounselor && (
//         <WaitingModal
//           isOpen={showWaitingModal}
//           onCancel={handleCancelWaiting}
//           waitingFor="상담사"
//           title="수락을 기다려주세요..."
//           message="상담사가 요청을 확인하고 있습니다. 잠시만 기다려주세요."
//         />
//       )}
//     </div>
//   );
// };

// export default Counsel;

import React, { useState, useRef } from 'react';
import ReviewModal from '../../components/modal/ReviewModal';
import CounselorRequestModal from '../../components/modal/CounselorRequestModal';
import WaitingModal from '../../components/modal/WaitingModal';

const Counsel = () => {
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);

  // 모달 열릴 때 포커스 관리를 위한 refs (접근성 모드에서 사용)
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // 시각장애인 모드 토글
  const toggleAccessibleMode = () => {
    setIsAccessibleMode(!isAccessibleMode);
  };

  // 리뷰 모달 열기
  const openReviewModal = counselor => {
    if (isAccessibleMode) {
      previousFocusRef.current = document.activeElement;
    }
    setSelectedCounselor(counselor);
    setShowReviewModal(true);
    document.body.style.overflow = 'hidden';
    // 접근성 모드에서 모달에 포커스
    if (isAccessibleMode) {
      setTimeout(() => {
        if (modalRef.current) modalRef.current.focus();
      }, 100);
    }
  };

  // 상담 요청 모달 열기
  const openRequestModal = counselor => {
    if (isAccessibleMode) {
      previousFocusRef.current = document.activeElement;
    }
    setSelectedCounselor(counselor);
    setShowRequestModal(true);
    document.body.style.overflow = 'hidden';
    if (isAccessibleMode) {
      setTimeout(() => {
        if (modalRef.current) modalRef.current.focus();
      }, 100);
    }
  };

  // 상담 요청 제출 처리
  const handleRequestSubmit = userInfo => {
    console.log('상담 요청:', userInfo, '상담사:', selectedCounselor?.name);
    setShowRequestModal(false);
    setShowWaitingModal(true); // 대기 모달 표시
  };

  // 대기 취소
  const handleCancelWaiting = () => {
    setShowWaitingModal(false);
    document.body.style.overflow = 'unset';
    console.log('상담 요청 취소');
    // 접근성 모드에서 포커스 복원
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setShowReviewModal(false);
    setShowRequestModal(false);
    setShowWaitingModal(false);
    document.body.style.overflow = 'unset';
    // 접근성 모드에서 포커스 복원
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  // 상담사 더미
  const counselors = [
    {
      id: 1,
      name: '다혜 상담사',
      title: '심리 상담 전문가',
      satisfaction: '98%',
      personalHistory: '5년',
      isAvailable: true,
      description:
        '자존감 향상과 자기 성장에 관심이 있는 분들께 도움을 드립니다.',
      reviewCount: 24,
      rating: 4.8,
    },
    {
      id: 2,
      name: '해빈 상담사',
      title: '심리 상담 전문가',
      satisfaction: '98%',
      personalHistory: '40년',
      isAvailable: true,
      description:
        '자존감 향상과 자기 성장에 관심이 있는 분들께 도움을 드립니다.',
      reviewCount: 56,
      rating: 4.9,
    },
    {
      id: 3,
      name: '동욱 상담사',
      title: '심리 상담 전문가',
      satisfaction: '97%',
      personalHistory: '5년',
      isAvailable: true,
      description:
        '청소년 상담과 학업 스트레스 관리에 전문성을 가지고 있습니다.',
      reviewCount: 18,
      rating: 4.7,
    },
    {
      id: 4,
      name: '성욱 상담사',
      title: '심리 상담 전문가',
      satisfaction: '95%',
      personalHistory: '8년',
      isAvailable: true,
      description: '커플 상담과 관계 문제 해결에 도움을 드릴 수 있습니다.',
      reviewCount: 32,
      rating: 4.6,
    },
    {
      id: 5,
      name: '주헌 상담사',
      title: '심리 상담 전문가',
      satisfaction: '99%',
      personalHistory: '12년',
      isAvailable: false,
      description:
        '트라우마와 외상 후 스트레스 장애에 전문적인 도움을 드립니다.',
      reviewCount: 45,
      rating: 4.9,
    },
    {
      id: 6,
      name: '경탁 상담사',
      title: '심리 상담 전문가',
      satisfaction: '96%',
      personalHistory: '7년',
      isAvailable: false,
      description:
        '자존감 향상과 자기 성장에 관심이 있는 분들께 도움을 드립니다.',
      reviewCount: 29,
      rating: 4.5,
    },
    {
      id: 7,
      name: '성원 상담사',
      title: '심리 상담 전문가',
      satisfaction: '94%',
      personalHistory: '4년',
      isAvailable: false,
      description: '스트레스 관리와 불면증 극복에 전문적인 도움을 드립니다.',
      reviewCount: 15,
      rating: 4.3,
    },
    {
      id: 8,
      name: '혜다 상담사',
      title: '심리 상담 전문가',
      satisfaction: '97%',
      personalHistory: '9년',
      isAvailable: false,
      description: '공황장애와 사회불안에 전문성을 가지고 있습니다.',
      reviewCount: 38,
      rating: 4.7,
    },
  ];

  // 시각장애인 모드 토글 버튼 스타일
  const toggleButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 15px',
    background: isAccessibleMode ? '#FF5722' : '#08976E',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 9999,
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const pageStyle = {
    backgroundImage: `
      radial-gradient(circle at 5% -2%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 4%),
      radial-gradient(circle at 0% 4%, rgba(233, 230, 47, 0.16) 0%, rgba(255, 255, 255, 0) 5%),
      radial-gradient(circle at 80% 3%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
      radial-gradient(circle at 6% 95%, rgba(249, 200, 255, 0.52) 0%, rgba(255, 255, 255, 0) 20%)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 시각장애인 모드 토글 버튼 */}
      <button onClick={toggleAccessibleMode} style={toggleButtonStyle}>
        {isAccessibleMode ? '일반 모드로 전환' : '시각장애인 모드로 전환'}
      </button>

      <div
        className="max-w-7xl mx-auto p-6 mt-6 bg-white rounded-3xl shadow-2xl relative overflow-hidden"
        style={pageStyle}
      >
        {/* 시각적 장식 요소 */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-20"
          aria-hidden={isAccessibleMode ? 'true' : undefined}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-green-50 rounded-full -ml-48 -mb-48 opacity-20"
          aria-hidden={isAccessibleMode ? 'true' : undefined}
        ></div>

        {/* 제목 */}
        <div className="flex items-center mb-6 relative z-10">
          <div
            className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full shadow-md"
            aria-hidden={isAccessibleMode ? 'true' : undefined}
          ></div>
          <h1
            style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
            className="text-2xl font-bold text-gray-800 relative"
            tabIndex={isAccessibleMode ? '0' : undefined}
          >
            상담사 찾기
          </h1>
        </div>

        {/* 시각장애인 모드에서만 보이는 페이지 설명 */}
        {isAccessibleMode && (
          <p className="sr-only">
            이 페이지에서는 다양한 심리 상담 전문가를 찾고 상담을 요청할 수
            있습니다. 각 상담사의 프로필, 경력, 전문 분야 및 리뷰를 확인할 수
            있습니다.
          </p>
        )}

        {/* 상담사 목록 스크린리더 설명 (시각장애인 모드에서만) */}
        {isAccessibleMode && (
          <p id="counselorListDescription" className="sr-only">
            총 {counselors.length}명의 상담사가 있습니다. 각 상담사 카드에는
            리뷰 보기와 상담 요청 버튼이 있습니다.
          </p>
        )}

        {/* 상담사 카드 그리드 */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
          role={isAccessibleMode ? 'list' : undefined}
          aria-labelledby={
            isAccessibleMode ? 'counselorListDescription' : undefined
          }
        >
          {counselors.map(counselor => (
            <div
              key={counselor.id}
              className="bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{
                boxShadow:
                  '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
              role={isAccessibleMode ? 'listitem' : undefined}
              aria-label={
                isAccessibleMode ? `${counselor.name} 상담사 프로필` : undefined
              }
            >
              {/* 상담사 프로필 상단 */}
              <div
                className="relative p-5 text-center"
                style={{
                  background: `linear-gradient(135deg, #79E7B7 0%, #08976E 100%)`,
                  boxShadow: '0 4px 6px -1px rgba(8, 151, 110, 0.2)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"
                  aria-hidden={isAccessibleMode ? 'true' : undefined}
                ></div>
                <div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"
                  aria-hidden={isAccessibleMode ? 'true' : undefined}
                ></div>

                {/* 프로필 이미지 */}
                <div
                  className="relative mx-auto w-20 h-20 mb-2 rounded-full shadow-lg overflow-hidden"
                  style={{
                    background: `#f9d3c0`,
                    boxShadow:
                      '0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(245, 242, 242, 0.5)',
                  }}
                  role={isAccessibleMode ? 'img' : undefined}
                  aria-label={
                    isAccessibleMode
                      ? `${counselor.name}의 프로필 이미지`
                      : undefined
                  }
                >
                  <div
                    className="absolute inset-0 shadow-inner rounded-full"
                    aria-hidden={isAccessibleMode ? 'true' : undefined}
                  ></div>
                </div>

                <h2
                  style={{
                    fontFamily: "'HancomMalangMalang-Regular', sans-serif",
                  }}
                  className="text-white text-lg font-bold drop-shadow-md"
                  tabIndex={isAccessibleMode ? '0' : undefined}
                >
                  {counselor.name}
                </h2>
                <p className="text-green-50 text-sm mb-2">{counselor.title}</p>

                <div className="flex justify-center mt-2 space-x-3">
                  <div
                    className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
                    style={{
                      boxShadow:
                        '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
                    }}
                  >
                    <p className="text-white text-sm font-bold">
                      {counselor.satisfaction}
                    </p>
                    <p className="text-green-50 text-xs">만족도</p>
                  </div>
                  <div
                    className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
                    style={{
                      boxShadow:
                        '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
                    }}
                  >
                    <p className="text-white text-sm font-bold">
                      {counselor.personalHistory}
                    </p>
                    <p className="text-green-50 text-xs">상담 경력</p>
                  </div>
                </div>
              </div>

              {/* 상담사 정보 하단 */}
              <div className="p-4">
                <div className="mb-2">
                  {counselor.isAvailable ? (
                    <div
                      className="flex items-center text-green-500"
                      aria-live={isAccessibleMode ? 'polite' : undefined}
                    >
                      <svg
                        className="w-5 h-5 mr-1 filter drop-shadow-sm"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden={isAccessibleMode ? 'true' : undefined}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span className="text-sm font-medium">
                        상담 자격증 보유
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      상담 자격증 보유
                    </span>
                  )}
                </div>

                <h3
                  className="font-bold mb-1 text-gray-800"
                  tabIndex={isAccessibleMode ? '0' : undefined}
                >
                  상담사 소개
                </h3>
                <p
                  className="text-sm text-gray-600 mb-3 leading-relaxed"
                  tabIndex={isAccessibleMode ? '0' : undefined}
                >
                  {counselor.description || '저한테 상담받으세요~'}
                </p>

                {/* 리뷰 버튼 */}
                <div
                  className="flex items-center mb-3 cursor-pointer group"
                  onClick={() => openReviewModal(counselor)}
                  role={isAccessibleMode ? 'button' : undefined}
                  tabIndex={isAccessibleMode ? '0' : undefined}
                  aria-label={
                    isAccessibleMode
                      ? `${counselor.name}의 리뷰 ${counselor.reviewCount}개 보기. 평점은 5점 만점에 ${counselor.rating}점입니다.`
                      : undefined
                  }
                  onKeyDown={
                    isAccessibleMode
                      ? e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openReviewModal(counselor);
                          }
                        }
                      : undefined
                  }
                >
                  <span className="text-sm font-medium mr-2 group-hover:text-green-500 transition-colors">
                    리뷰 {counselor.reviewCount || '20'}+
                  </span>
                  <div
                    className="flex"
                    aria-hidden={isAccessibleMode ? 'true' : undefined}
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(counselor.rating || 5)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } filter drop-shadow-sm`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  {/* 리뷰 더보기 */}
                  <svg
                    className="w-4 h-4 ml-1 text-gray-400 group-hover:text-green-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden={isAccessibleMode ? 'true' : undefined}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>

                <div
                  className="p-3 rounded-lg mb-3 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-16 h-16 bg-gray-200 opacity-30 rounded-full -mr-8 -mt-8"
                    aria-hidden={isAccessibleMode ? 'true' : undefined}
                  ></div>
                  <p
                    className="text-sm text-gray-600 relative z-10"
                    tabIndex={isAccessibleMode ? '0' : undefined}
                  >
                    어떤 상담 받으시나요? 궁금...
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-3">
                  <div className="flex items-center justify-center">
                    <div
                      className="flex items-center text-green-500"
                      aria-live={isAccessibleMode ? 'polite' : undefined}
                    >
                      <span
                        className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-sm"
                        aria-hidden={isAccessibleMode ? 'true' : undefined}
                      ></span>
                      <span
                        className="text-sm"
                        id={
                          isAccessibleMode
                            ? `status-counselor-${counselor.id}`
                            : undefined
                        }
                      >
                        {counselor.isAvailable
                          ? '현재 상담 가능 상태입니다.'
                          : '현재 상담이 불가능합니다.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 상담 요청 버튼 */}
                <button
                  className="w-1/2 mx-auto block text-white py-2 rounded-full font-medium transition duration-200 transform hover:scale-105"
                  style={{
                    background: counselor.isAvailable
                      ? 'linear-gradient(to right, #79E7B7, #08976E)'
                      : 'linear-gradient(to right, #9CA3AF, #6B7280)',
                    boxShadow: counselor.isAvailable
                      ? '0 4px 6px -1px rgba(8, 151, 110, 0.3), 0 2px 4px -1px rgba(8, 151, 110, 0.1)'
                      : '0 4px 6px -1px rgba(107, 114, 128, 0.3), 0 2px 4px -1px rgba(107, 114, 128, 0.1)',
                  }}
                  onClick={() => openRequestModal(counselor)}
                  disabled={!counselor.isAvailable}
                  aria-label={
                    isAccessibleMode
                      ? `${counselor.name}에게 상담 요청하기`
                      : undefined
                  }
                  aria-describedby={
                    isAccessibleMode
                      ? `status-counselor-${counselor.id}`
                      : undefined
                  }
                >
                  상담 요청
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 모달 */}
      {showReviewModal && selectedCounselor && (
        <div
          ref={isAccessibleMode ? modalRef : null}
          role={isAccessibleMode ? 'dialog' : undefined}
          aria-label={
            isAccessibleMode ? `${selectedCounselor.name}의 리뷰` : undefined
          }
          aria-modal={isAccessibleMode ? 'true' : undefined}
          tabIndex={isAccessibleMode ? '-1' : undefined}
        >
          <ReviewModal counselor={selectedCounselor} onClose={closeModal} />
        </div>
      )}

      {/* 상담 요청 모달 */}
      {showRequestModal && selectedCounselor && (
        <div
          ref={isAccessibleMode ? modalRef : null}
          role={isAccessibleMode ? 'dialog' : undefined}
          aria-label={
            isAccessibleMode
              ? `${selectedCounselor.name}에게 상담 요청하기`
              : undefined
          }
          aria-modal={isAccessibleMode ? 'true' : undefined}
          tabIndex={isAccessibleMode ? '-1' : undefined}
        >
          <CounselorRequestModal
            isOpen={showRequestModal}
            onClose={closeModal}
            onSubmit={handleRequestSubmit}
          />
        </div>
      )}

      {/* 상담사 대기 모달 */}
      {showWaitingModal && selectedCounselor && (
        <div
          ref={isAccessibleMode ? modalRef : null}
          role={isAccessibleMode ? 'dialog' : undefined}
          aria-label={isAccessibleMode ? '상담 요청 처리 중' : undefined}
          aria-modal={isAccessibleMode ? 'true' : undefined}
          tabIndex={isAccessibleMode ? '-1' : undefined}
          aria-live={isAccessibleMode ? 'assertive' : undefined}
        >
          <WaitingModal
            isOpen={showWaitingModal}
            onCancel={handleCancelWaiting}
            waitingFor="상담사"
            title="수락을 기다려주세요..."
            message="상담사가 요청을 확인하고 있습니다. 잠시만 기다려주세요."
          />
        </div>
      )}
    </div>
  );
};

export default Counsel;
