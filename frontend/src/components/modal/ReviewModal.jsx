import React, { useState, useEffect } from 'react';
import counselorChannelService from '../../api/counselorChannel';

const ReviewModal = ({
  counselor,
  sessionId,
  onClose,
  contentType = 'review',
}) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(contentType === 'review');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  // 리뷰 조회 함수
  const fetchReviews = async (page = 1) => {
    if (contentType !== 'review') return;

    setIsLoading(true);
    try {
      const response = await counselorChannelService.getCounselorReviews(
        counselor.id,
        {
          page,
          size: 5,
          sort: 'latest',
        },
      );

      if (response && response.data) {
        setReviews(response.data.reviews || []);
        setPagination({
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.total_pages,
          totalCount: response.data.pagination.total_count,
        });
      }
    } catch (err) {
      console.error('리뷰 조회 오류:', err);
      setError('리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 리뷰 조회
  useEffect(() => {
    if (counselor && counselor.id && contentType === 'review') {
      fetchReviews();
    }
  }, [counselor, contentType]);

  // 페이지 변경 핸들러
  const handlePageChange = page => {
    fetchReviews(page);
  };

  // 임시 리뷰 데이터 (API 연결 전)
  const dummyReviews = [
    {
      review_id: '1',
      user_nickname: '김상담',
      content:
        '정말 도움이 많이 되었습니다. 상담사님의 조언 덕분에 제 문제를 새로운 시각으로 바라볼 수 있게 되었어요.',
      score: 5,
      created_at: '2023-10-15 14:30:00',
    },
    {
      review_id: '2',
      user_nickname: '박내담',
      content:
        '친절하고 전문적인 상담 감사합니다. 다음에도 기회가 되면 또 상담 받고 싶어요.',
      score: 4,
      created_at: '2023-10-10 09:15:00',
    },
  ];

  // 실제 API 응답이 오기 전에 임시로 사용
  const displayReviews = reviews.length > 0 ? reviews : dummyReviews;

  // 별점 렌더링 함수
  const renderStars = score => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <svg
          key={index}
          className={`w-4 h-4 ${
            index < score
              ? 'text-yellow-400 filter drop-shadow-sm'
              : 'text-gray-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      ));
  };

  // 날짜 포맷팅 함수
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 모달 외부 클릭 시 닫기
  const handleOutsideClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity animate-fadeIn"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform animate-modalSlideIn">
        {/* 헤더 - 그라데이션 배경 추가 */}
        <div
          className="p-6 border-b flex items-start justify-between relative overflow-hidden"
          style={{
            background:
              contentType === 'bio'
                ? 'linear-gradient(135deg, #f0fff4, #def7e5)'
                : 'linear-gradient(135deg, #f7fafc, #ebf4ff)',
          }}
        >
          {/* 장식용 원형 요소 */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white opacity-10 -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white opacity-10 -ml-8 -mb-8"></div>

          <div className="relative z-10">
            <h2
              id="review-modal-title"
              className="text-xl font-bold text-gray-800 flex items-center"
            >
              {contentType === 'bio' ? (
                <>
                  <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-green-100 text-green-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </span>
                  <span className="text-green-800">{`${counselor.name} 소개`}</span>
                </>
              ) : (
                <>
                  <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-blue-100 text-blue-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      ></path>
                    </svg>
                  </span>
                  <span className="text-blue-800">{`${counselor.name} 리뷰`}</span>
                </>
              )}
            </h2>
            {contentType === 'review' && (
              <div className="flex items-center mt-3 ml-11">
                <div className="flex mr-2">
                  {renderStars(counselor.rating || 4.5)}
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  평균 {counselor.rating || '4.5'}
                  <span className="ml-1 text-gray-500 font-normal">
                    ({pagination.totalCount || displayReviews.length}개 리뷰)
                  </span>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-white bg-opacity-80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-100 shadow-sm z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-label="닫기"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {contentType === 'bio' ? (
          /* 상담사 소개 내용 */
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
            <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 border-4 border-white shadow-lg relative">
                {counselor.profile_url ? (
                  <img
                    src={counselor.profile_url}
                    alt={counselor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center">
                    <span className="text-green-700 text-2xl font-bold">
                      {counselor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 ring-4 ring-white ring-opacity-50 rounded-full"></div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-800">
                  {counselor.name}
                </h3>
                <p className="text-gray-600 mt-1 flex items-center justify-center md:justify-start">
                  <span className="bg-green-50 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full mr-2">
                    {counselor.title}
                  </span>
                  <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    경력 {counselor.personalHistory}
                  </span>
                </p>
                <div className="flex items-center mt-3 justify-center md:justify-start space-x-3">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-yellow-400 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className="text-sm text-gray-600">
                      {counselor.rating || 4.5}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="text-sm text-gray-600">
                    만족도 {counselor.satisfaction || '95%'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 mr-2 rounded-full bg-green-100 text-green-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                상담사 소개
              </h4>
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {counselor.bio || '소개글이 없습니다.'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 mr-2 rounded-full bg-green-100 text-green-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
                자격증
              </h4>
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <ul className="space-y-2">
                  {counselor.certifications &&
                  counselor.certifications.length > 0 ? (
                    counselor.certifications.map((cert, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-700"
                      >
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                        {cert}
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center text-gray-500 italic">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3"></span>
                      정보가 없습니다.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* 리뷰 목록 */
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">리뷰를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-6 bg-red-50 rounded-lg flex flex-col items-center">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="font-medium">{error}</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  onClick={() => fetchReviews()}
                >
                  다시 시도
                </button>
              </div>
            ) : displayReviews.length === 0 ? (
              <div className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg flex flex-col items-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-lg font-medium mb-2">아직 리뷰가 없습니다</p>
                <p className="text-gray-400 text-sm">
                  첫 번째 리뷰를 남겨보세요!
                </p>
              </div>
            ) : (
              <ul className="space-y-6">
                {displayReviews.map(review => (
                  <li
                    key={review.review_id}
                    className="border-b pb-6 hover:bg-gray-50 p-4 rounded-lg -mx-4 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 font-semibold">
                          {review.user_nickname.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">
                          {review.user_nickname}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                        <svg
                          className="w-3.5 h-3.5 mr-1.5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <div className="flex mb-3 bg-yellow-50 py-1 px-2 rounded-lg inline-flex items-center">
                      {renderStars(review.score)}
                      <span className="ml-2 text-sm text-yellow-700">
                        {review.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-gray-700 whitespace-pre-line">
                        {review.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 페이지네이션 (리뷰 모드에서만 표시) */}
        {contentType === 'review' && pagination.totalPages > 1 && (
          <div className="border-t p-4 flex justify-center bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pagination.currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="첫 페이지"
              >
                &laquo;
              </button>

              {/* 이전 페이지 버튼 */}
              <button
                onClick={() =>
                  handlePageChange(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pagination.currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="이전 페이지"
              >
                &lsaquo;
              </button>

              {/* 페이지 번호 렌더링 최적화 */}
              {(() => {
                const pageButtons = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(
                  1,
                  pagination.currentPage - Math.floor(maxVisiblePages / 2),
                );
                let endPage = Math.min(
                  pagination.totalPages,
                  startPage + maxVisiblePages - 1,
                );

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      disabled={i === pagination.currentPage}
                      className={`w-9 h-9 rounded-md transition-colors ${
                        i === pagination.currentPage
                          ? 'bg-blue-500 text-white font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-label={`${i} 페이지`}
                      aria-current={
                        i === pagination.currentPage ? 'page' : undefined
                      }
                    >
                      {i}
                    </button>,
                  );
                }
                return pageButtons;
              })()}

              {/* 다음 페이지 버튼 */}
              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.totalPages, pagination.currentPage + 1),
                  )
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pagination.currentPage === pagination.totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="다음 페이지"
              >
                &rsaquo;
              </button>

              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pagination.currentPage === pagination.totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="마지막 페이지"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 아래 스타일 태그는 실제 구현시 CSS 파일로 분리 */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;
