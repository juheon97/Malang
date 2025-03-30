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
          className={`w-4 h-4 ${index < score ? 'text-yellow-400' : 'text-gray-200'}`}
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

  // 전문 분야 표시용 helper 함수
  const getSpecialtyText = () => {
    // specialty나 speciality 필드가 있는지 확인하고 사용
    return counselor.specialty || counselor.speciality || '정보가 없습니다.';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="p-6 border-b flex items-start justify-between bg-gradient-to-r from-green-50 to-green-100">
          <div>
            <h2
              id="review-modal-title"
              className="text-xl font-bold text-gray-800"
            >
              {contentType === 'bio'
                ? `${counselor.name} 소개`
                : `${counselor.name} 상담사 리뷰`}
            </h2>
            {contentType === 'review' && (
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStars(counselor.rating || 4.5)}
                </div>
                <span className="text-gray-600 text-sm">
                  평균 {counselor.rating || '4.5'} (
                  {pagination.totalCount || displayReviews.length}개 리뷰)
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1 hover:bg-gray-100"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6"
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden mr-5 border-4 border-white shadow-md">
                {counselor.profile_url ? (
                  <img
                    src={counselor.profile_url}
                    alt={counselor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200"></div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {counselor.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {counselor.title} | 경력 {counselor.personalHistory}
                </p>
              </div>
            </div>
            {/* 
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                전문 분야
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-700">{getSpecialtyText()}</p>
              </div>
            </div> */}

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
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
                상담사 소개
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-700 whitespace-pre-line">
                  {counselor.bio || '소개글이 없습니다.'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
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
                자격증
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <ul className="list-disc pl-5">
                  {counselor.certifications &&
                  counselor.certifications.length > 0 ? (
                    counselor.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700 ml-2 py-1">
                        {cert}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700 ml-2">정보가 없습니다.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* 리뷰 목록 */
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
                <svg
                  className="w-6 h-6 mx-auto mb-2"
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
                {error}
              </div>
            ) : displayReviews.length === 0 ? (
              <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300 mb-3"
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
                아직 리뷰가 없습니다.
              </div>
            ) : (
              <ul className="space-y-6">
                {displayReviews.map(review => (
                  <li key={review.review_id} className="border-b pb-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-medium text-gray-800">
                        {review.user_nickname}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <div className="flex mb-3">{renderStars(review.score)}</div>
                    <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {review.content}
                    </p>
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
              >
                &laquo;
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={page === pagination.currentPage}
                    className={`w-9 h-9 rounded-md transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-green-500 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pagination.currentPage === pagination.totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
