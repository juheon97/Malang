import React, { useState } from 'react';

const ReviewModal = ({ counselor, onClose }) => {
  // 정렬 상태 (최신순/도움순)
  const [sortType, setSortType] = useState('latest'); // 'latest' 또는 'helpful'
  
  // 리뷰 더미 데이터
  const reviews = [
    {
      id: 1,
      userId: "익명의 리뷰어",
      date: "2025.03.13",
      content: "우와 상담을 되게 잘해주시는데요 !! 많은 도움 얻고 갑니다!!!!"
    },
    {
      id: 2,
      userId: "익명의 리뷰어",
      date: "2025.03.13",
      content: "우와 상담을 되게 잘해주시는데요 !! 많은 도움 얻고 갑니다!!!!"
    },
    {
      id: 3,
      userId: "익명의 리뷰어",
      date: "2025.03.13",
      content: "우와 상담을 되게 잘해주시는데요 !! 많은 도움 얻고 갑니다!!!!"
    },
    {
      id: 4,
      userId: "익명의 리뷰어",
      date: "2025.03.13",
      content: "우와 상담을 되게 잘해주시는데요 !! 많은 도움 얻고 갑니다!!!!"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      

      <div className="relative w-full max-w-xl mx-4 h-[90vh]">
       {/* 갈색색 */}
        <div className="absolute -right-1 -left-1 top-1 bottom-0 bg-[#BE9A67]"></div>
        
      {/* 회색종이이 */}
        <div className="absolute right-2 left-6 top-5 bottom-2 bg-[#C2C2C2]"></div>
        
        {/* 흰색종이이 */}
        <div className="absolute inset-x-4 top-3 bottom-4 bg-white"></div>
        
        {/* 클립립 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-200 rounded-full shadow-md z-10">
          <div className="w-12 h-12 bg-gray-300 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-8 h-8 bg-gray-400 opacity-30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-6 h-6 bg-gray-500 opacity-10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* 모달 내용 */}
        <div className="relative pt-12 pb-4 rounded-lg overflow-hidden mx-10">
          {/* 상담사 헤더더 */}
          <div 
            className="rounded-xl p-2 text-center"
            style={{
                background: `linear-gradient(135deg, #79E7B7 0%, #08976E 100%)`,
                boxShadow: "0 4px 6px -1px rgba(8, 151, 110, 0.2)"
              }}
          >
            <div className="flex flex-col items-center justify-center">
           
              {/* <div className="relative w-24 h-24 rounded-full bg-[#f9d3c0] border-2 border-white overflow-hidden">
                
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#2563EB]"></div>
              </div> */}
              
              <h2 
                className="text-white text-2xl font-bold mt-2"
              >
                다혜 상담사
              </h2>
              
              {/* 별점 */}
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className="w-5 h-5 text-yellow-300" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
          </div>
          
       
          <div className="mt-6 mb-2 flex justify-end pr-4">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <span className="mr-1 text-gray-800 font-bold">•</span>
                <span className="text-gray-800">최신순</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1 text-gray-400">•</span>
                <span className="text-gray-400">도움순</span>
              </div>
            </div>
          </div>
          
          {/* 리뷰 목록*/}
          <div className="overflow-y-auto max-h-[65vh] space-y-4 py-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-[#F9FFF8] p-4 mb-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-green-600 font-medium">익명의 리뷰어</span>
                  </div>
                  <span className="text-xs text-gray-400">작성일 {review.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;