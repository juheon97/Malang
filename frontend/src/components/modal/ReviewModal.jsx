import React, { useState, useEffect } from 'react';
import clipImage from '../../assets/image/clip.png';

const ReviewModal = ({ counselor, onClose }) => {
  // 정렬 상태 (최신순/도움순)
  const [sortType, setSortType] = useState('latest');

  // 리뷰 더미 데이터 (좋아요 카운트 추가)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userId: '익명의 리뷰어',
      date: '2025.03.13',
      content:
        '우와 상담을 되게 잘해주시는데요 !! 많은 도움 얻고 갑니다!!!! 길면 어떻게 되는지 확인을 해야되니까 리뷰를 길게길게 엄청 길게 써볼까 어떻게 될까 어떻게 되나 너무 길면 가리는게 맞나 이걸 또 눌러서 모달이 뜨는게 맞나 어떡하쥥',
      likes: 12,
      isLiked: false,
    },
    {
      id: 2,
      userId: '익명의 리뷰어',
      date: '2025.03.12',
      content:
        '선생님의 조언이 정말 도움이 되었습니다. 다음에도 상담 받고 싶어요.',
      likes: 8,
      isLiked: false,
    },
    {
      id: 3,
      userId: '익명의 리뷰어',
      date: '2025.03.10',
      content: '친절하게 상담해주셔서 감사합니다. 많은 도움이 되었어요!',
      likes: 5,
      isLiked: false,
    },
    {
      id: 4,
      userId: '익명의 리뷰어',
      date: '2025.03.05',
      content:
        '정말 전문적으로 상담해주셨어요. 현실적인 조언들이 큰 도움이 됐습니다.',
      likes: 15,
      isLiked: false,
    },
  ]);

  // 정렬된 리뷰 데이터
  const [sortedReviews, setSortedReviews] = useState([]);

  // 정렬 타입에 따라 리뷰 정렬 - 컴포넌트 마운트와 sortType 변경 시 실행
  useEffect(() => {
    let sorted = [...reviews];

    if (sortType === 'latest') {
      // 날짜 형식을 파싱하여 최신순으로 정렬
      sorted.sort((a, b) => {
        const dateA = new Date(a.date.split('.').join('-'));
        const dateB = new Date(b.date.split('.').join('-'));
        return dateB - dateA;
      });
    } else if (sortType === 'helpful') {
      // 좋아요 수에 따라 도움순으로 정렬
      sorted.sort((a, b) => b.likes - a.likes);
    }

    setSortedReviews(sorted);
  }, [reviews, sortType]);

  // reviews 변경 시 정렬된 리뷰도 업데이트
  useEffect(() => {
    let sorted = [...reviews];

    if (sortType === 'latest') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.date.split('.').join('-'));
        const dateB = new Date(b.date.split('.').join('-'));
        return dateB - dateA;
      });
    } else if (sortType === 'helpful') {
      sorted.sort((a, b) => b.likes - a.likes);
    }

    setSortedReviews(sorted);
  }, [reviews]);

  // 좋아요 토글 함수
  const handleLikeToggle = reviewId => {
    setReviews(
      reviews.map(review => {
        if (review.id === reviewId) {
          const isLiked = !review.isLiked;
          return {
            ...review,
            likes: isLiked ? review.likes + 1 : review.likes - 1,
            isLiked,
          };
        }
        return review;
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-xl mx-4 h-[90vh]">
        {/* 갈색 배경 */}
        <div className="absolute -right-1 -left-1 top-1 bottom-0 bg-[#BE9A67]"></div>

        {/* 회색 종이 */}
        <div className="absolute right-2 left-6 top-5 bottom-2 bg-[#C2C2C2]"></div>

        {/* 흰색 종이 */}
        <div className="absolute inset-x-4 top-3 bottom-4 bg-white overflow-hidden"></div>

        {/* 클립 이미지 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <img
            src={clipImage}
            alt="Clip"
            className="w-17 h-17 object-contain"
            onError={e => {
              // 이미지 로드 실패 시 폴백 - 기존 클립 스타일 사용
              e.target.style.display = 'none';
              document.getElementById('fallback-clip').style.display = 'block';
            }}
          />

          {/* 클립 이미지 로드 실패하면면 */}
          <div
            id="fallback-clip"
            className="w-16 h-16 bg-gray-200 rounded-full shadow-md hidden"
            style={{ display: 'none' }}
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-8 h-8 bg-gray-400 opacity-30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-6 h-6 bg-gray-500 opacity-10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* 모달 내용*/}
        <div className="relative pt-12 pb-4 rounded-lg overflow-hidden mx-10">
          {/* 상담사 헤더 */}
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{
              background: `linear-gradient(135deg, #79E7B7 0%, #08976E 100%)`,
              boxShadow: '0 4px 6px -1px rgba(8, 151, 110, 0.2)',
            }}
          >
            <div className="flex items-center justify-center">
              {/* 상담사 프로필 이미지 */}
              <div className="relative w-16 h-16 rounded-full bg-[#FCE2D0] border-2 border-white overflow-hidden mr-8"></div>

              <div className="flex flex-col">
                <h2 className="text-white text-2xl font-bold">다혜 상담사</h2>

                {/* 별점 */}
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
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
          </div>

          {/* 정렬 */}
          <div className="mt-6 mb-2 flex justify-end">
            <div className="flex items-center space-x-4 text-xs">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setSortType('latest')}
              >
                <span
                  className={`mr-1 ${sortType === 'latest' ? 'text-gray-800 font-bold' : 'text-gray-400'}`}
                >
                  •
                </span>
                <span
                  className={
                    sortType === 'latest' ? 'text-gray-800' : 'text-gray-400'
                  }
                >
                  최신순
                </span>
              </div>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setSortType('helpful')}
              >
                <span
                  className={`mr-1 ${sortType === 'helpful' ? 'text-gray-800 font-bold' : 'text-gray-400'}`}
                >
                  •
                </span>
                <span
                  className={
                    sortType === 'helpful' ? 'text-gray-800' : 'text-gray-400'
                  }
                >
                  도움순
                </span>
              </div>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div
            className="overflow-y-auto scrollbar-hide h-[calc(90vh-230px)] py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedReviews.map(review => (
              <div
                key={review.id}
                className="bg-[#F9FFF8] p-4 mb-4 rounded shadow-md"
                style={{
                  boxShadow:
                    '0 4px 3px rgba(0,0,0,0.1), inset 0 2px 4px rgba(245, 242, 242, 0.5)',
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {review.userId}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    작성일 {review.date}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3">{review.content}</p>

                {/* 좋아요 버튼 */}
                <div className="flex justify-end mt-3">
                  <button
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => handleLikeToggle(review.id)}
                  >
                    <svg
                      className={`w-5 h-5 ${review.isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                      viewBox="0 0 20 20"
                      fill={review.isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{review.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
