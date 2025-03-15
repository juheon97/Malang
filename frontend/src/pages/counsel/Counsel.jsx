import React, { useState } from 'react';
import ReviewModal from '../../components/modal/ReviewModal';

const Counsel = () => {
   
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [showModal, setShowModal] = useState(false);
  
    // 모달 열기
    const openReviewModal = (counselor) => {
      setSelectedCounselor(counselor);
      setShowModal(true);
      document.body.style.overflow = 'hidden';
    };
  
    // 모달 닫기
    const closeModal = () => {
      setShowModal(false);
      document.body.style.overflow = 'unset';
    };
  
    // 상담사 더미
    const counselors = [
      {
        id: 1,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: true,
      },
      {
        id: 2,
        name: '해빈 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '40분',
        isAvailable: true,
      },
      {
        id: 3,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: true,
      },
      {
        id: 4,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: true,
      },
      {
        id: 5,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: false,
      },
      {
        id: 6,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: false,
      },
      {
        id: 7,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: false,
      },
      {
        id: 8,
        name: '다혜 상담사',
        title: '심리 상담 전문가',
        satisfaction: '98%',
        responseTime: '5분',
        isAvailable: false,
      },
    ];
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
     
        <div className="max-w-7xl mx-auto p-8 mt-8 bg-white rounded-3xl shadow-xl relative overflow-hidden">

          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-50 rounded-full -ml-48 -mb-48 opacity-20"></div>
          
          {/* 제목 */}
          <div className="flex items-center mb-10 relative z-10">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full shadow-md"></div>
            <h1 
              style={{fontFamily: "'HancomMalangMalang-Regular', sans-serif"}} 
              className="text-2xl font-bold text-gray-800 relative">
              상담사 찾기
            </h1>
          </div>
  
          {/* 상담사 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {counselors.map((counselor) => (
              <div 
                key={counselor.id} 
                className="bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* 상담사 프로필 상단 */}
                <div 
                  className="relative p-6 text-center"
                  style={{
                    background: `linear-gradient(135deg, #79E7B7 0%, #08976E 100%)`,
                    boxShadow: "0 4px 6px -1px rgba(8, 151, 110, 0.2)"
                  }}
                >
         
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative mx-auto w-24 h-24 mb-3 rounded-full shadow-lg overflow-hidden"
                    style={{
                      background: `#f9d3c0`,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(245, 242, 242, 0.5)"
                    }}
                  >
                    <div className="absolute inset-0 shadow-inner rounded-full"></div>
                  </div>
                  
                  <h2 
                    style={{fontFamily: "'HancomMalangMalang-Regular', sans-serif"}} 
                    className="text-white text-xl font-bold drop-shadow-md"
                  >
                    {counselor.name}
                  </h2>
                  <p className="text-green-50 text-sm mb-3">{counselor.title}</p>
  
                  <div className="flex justify-center mt-3 space-x-3">
                    <div 
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 transform transition hover:scale-105"
                      style={{boxShadow: "0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)"}}
                    >
                      <p className="text-white text-sm font-bold">{counselor.satisfaction}</p>
                      <p className="text-green-50 text-xs">만족도</p>
                    </div>
                    <div 
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 transform transition hover:scale-105"
                      style={{boxShadow: "0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)"}}
                    >
                      <p className="text-white text-sm font-bold">{counselor.responseTime}</p>
                      <p className="text-green-50 text-xs">상담 대기</p>
                    </div>
                  </div>
                </div>
  
                {/* 상담사 정보 하단 */}
                <div className="p-5">
                  <div className="mb-3">
                    {counselor.isAvailable ? (
                      <div className="flex items-center text-green-500">
                        <svg className="w-5 h-5 mr-1 filter drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm font-medium">상담 자격증 보유</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">상담 자격증 보유</span>
                    )}
                  </div>
  
                  <h3 className="font-bold mb-1 text-gray-800">상담사 소개</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">저한테 상담받으세요~</p>
  
              {/* 리뷰뷰 */}
                  <div 
                    className="flex items-center mb-4 cursor-pointer group"
                    onClick={() => openReviewModal(counselor)}
                  >
                    <span className="text-sm font-medium mr-2 group-hover:text-green-500 transition-colors">리뷰 20+</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          className="w-4 h-4 text-yellow-400 filter drop-shadow-sm" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    {/* 리뷰 더보기 */}
                    <svg className="w-4 h-4 ml-1 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
  
                  <div 
                    className="p-4 rounded-lg mb-4 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(to right, #f9fafb, #f3f4f6)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                    }}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gray-200 opacity-30 rounded-full -mr-8 -mt-8"></div>
                    <p className="text-sm text-gray-600 relative z-10">어떤 상담 받으시나요? 궁금...</p>
                  </div>
  
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center text-green-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-sm"></span>
                        <span className="text-sm">현재 상담 가능 상태입니다.</span>
                      </div>
                    </div>
                  </div>
  
                  <button 
                    className="w-1/2 mx-auto block text-white py-2 rounded-full font-medium transition duration-200 transform hover:scale-105"
                    style={{
                      background: "linear-gradient(to right, #79E7B7, #08976E)",
                      boxShadow: "0 4px 6px -1px rgba(8, 151, 110, 0.3), 0 2px 4px -1px rgba(8, 151, 110, 0.1)"
                    }}
                  >
                    상담 요청
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* 리뷰 모달 */}
        {showModal && selectedCounselor && (
          <ReviewModal 
            counselor={selectedCounselor} 
            onClose={closeModal} 
          />
        )}
      </div>
    );
  };
  
  export default Counsel;