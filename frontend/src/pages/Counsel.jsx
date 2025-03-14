import React from 'react';
import { Link } from 'react-router-dom';

const Counsel  = () => {
  // 상담사 더미 데이터
  const counselors = [
    {
      id: 1,
      name: '다혜 상담사',
      title: '심리 상담 전문가',
      satisfaction: '98%',
      responseTime: '5분',
      isAvailable: false,
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
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto p-6 mt-8 bg-white rounded-3xl shadow-lg">
        {/* 제목 */}
        <div className="flex items-center mb-8">
          <div className="w-1 h-8 bg-green-500 mr-3"></div>
          <h1 className="text-2xl font-bold">상담사 찾기</h1>
        </div>

        {/* 상담사 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {counselors.map((counselor) => (
            <div key={counselor.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
              {/* 상담사 프로필 상단 */}
              <div className="relative bg-gradient-to-r from-[#79E7B7] to-[#08976E] p-6 text-center">
                <div className="mx-auto bg-[#f9d3c0] w-24 h-24 rounded-full mb-2 flex items-center justify-center overflow-hidden">
                  <img src={`/assets/counselor-${counselor.id}.png`} alt={counselor.name} className="w-full h-full object-cover" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/100?text=상담사";
                  }} />
                </div>
                <h2 style={{fontFamily: "'HancomMalangMalang-Regular', sans-serif"}} className="text-white text-xl font-bold">{counselor.name}</h2>
                <p className="text-white text-sm">{counselor.title}</p>

                <div className="flex justify-center mt-3 space-x-2">
                  <div className="bg-[#e0fffa] bg-opacity-30 rounded-lg px-3 py-1">
                    <p className="text-white text-sm">{counselor.satisfaction}</p>
                    <p className="text-white text-xs">만족도</p>
                  </div>
                  <div className="bg-[#e0fffa] bg-opacity-30 rounded-lg px-3 py-1">
                    <p className="text-white text-sm">{counselor.responseTime}</p>
                    <p className="text-white text-xs">상담 대기</p>
                  </div>
                </div>
              </div>

              {/* 상담사 정보 하단 */}
              <div className="p-4">
                <div className="mb-3">
                  {counselor.isAvailable ? (
                    <div className="flex items-center text-green-500">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm">상담 자격증 보유</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">상담 자격증 보유</span>
                  )}
                </div>

                <h3 className="font-bold mb-1">상담사 소개</h3>
                <p className="text-sm text-gray-600 mb-3">마인챌리지 커리어 상담을 통해 자신을 키워가는 사람입니다. 함아주세요.</p>

                <div className="flex items-center mb-4">
                  <span className="text-sm mr-2">리뷰 20+</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-100 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">어떤 상담 받으시나요? 궁금...</p>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center text-green-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-sm">현재 상담 가능 상태입니다.</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-[#79E7B7] to-[#08976E] hover:from-[#6AD3A6] hover:to-[#078263] text-white py-2 rounded-full transition duration-200">
                  상담 요청
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Counsel;