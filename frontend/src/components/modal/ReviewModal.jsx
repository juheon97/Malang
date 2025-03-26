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
          className={`w-4 h-4 ${index < score ? 'text-yellow-400' : 'text-gray-300'}`}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-5 border-b flex items-start justify-between bg-gradient-to-r from-green-50 to-green-100">
          <div>
            <h2
              id="review-modal-title"
              className="text-xl font-bold text-gray-800"
            >
              {contentType === 'bio'
                ? `${counselor.name} 상담사 소개`
                : `${counselor.name} 상담사 리뷰`}
            </h2>
            {contentType === 'review' && (
              <div className="flex items-center mt-1">
                <div className="flex mr-2">
                  {renderStars(counselor.rating || 4.5)}
                </div>
                <span className="text-gray-600">
                  평균 {counselor.rating || '4.5'} (
                  {pagination.totalCount || displayReviews.length}개 리뷰)
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
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
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                {counselor.profile_url ? (
                  <img
                    src={counselor.profile_url}
                    alt={counselor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{counselor.name}</h3>
                <p className="text-gray-600">
                  {counselor.title} | 경력 {counselor.personalHistory}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">전문 분야</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {counselor.specialty || '정보가 없습니다.'}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">상담사 소개</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {counselor.bio || '소개글이 없습니다.'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">자격증</h4>
              <ul className="list-disc pl-5 bg-gray-50 p-3 rounded-lg">
                {counselor.certifications &&
                counselor.certifications.length > 0 ? (
                  counselor.certifications.map((cert, index) => (
                    <li key={index} className="text-gray-700 ml-2">
                      {cert}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-700 ml-2">정보가 없습니다.</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          /* 리뷰 목록 */
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">{error}</div>
            ) : displayReviews.length === 0 ? (
              <div className="text-center text-gray-500 p-8">
                아직 리뷰가 없습니다.
              </div>
            ) : (
              <ul className="space-y-6">
                {displayReviews.map(review => (
                  <li key={review.review_id} className="border-b pb-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {review.user_nickname}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <div className="flex mb-2">{renderStars(review.score)}</div>
                    <p className="text-gray-700 whitespace-pre-line">
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
          <div className="border-t p-3 flex justify-center">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
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
                    className={`px-3 py-1 rounded ${page === pagination.currentPage ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
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
