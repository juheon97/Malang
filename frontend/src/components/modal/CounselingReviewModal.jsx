import React, { useState } from 'react';
import counselorChannel from '../../api/counselorChannel';

const CounselingReviewModal = ({ counselor, sessionId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(3); // 기본 별점
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // counselor가 없는 경우 상담사로
  const counselorName = counselor?.name || '상담사';

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError('리뷰 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // API 서비스를 통해 리뷰 제출
      const response = await counselorChannel.submitCounselingReview(
        sessionId,
        {
          score: rating, // API 요청 본문 형식에 맞게 속성명 변경 (rating -> score)
          content: reviewText, // API 요청 본문 형식에 맞게 속성명 변경 (reviewText -> content)
        },
      );

      // 부모 컴포넌트에 성공 알림
      onSubmit &&
        onSubmit({
          counselorId: counselor?.id,
          rating,
          reviewText,
          reviewId: response?.data?.review_id,
        });

      // 모달 닫기
      onClose();
    } catch (err) {
      console.error('리뷰 제출 오류:', err);
      setError('리뷰 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">상담이 종료되었습니다.</h2>
          <p className="text-gray-700">
            {counselorName} 상담사님을 평가해주세요.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="font-bold mb-2">별점</div>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                disabled={isSubmitting}
                className={`text-3xl focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`${star}점`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-1">
            {rating === 1 && '매우 불만족'}
            {rating === 2 && '불만족'}
            {rating === 3 && '보통'}
            {rating === 4 && '만족'}
            {rating === 5 && '매우 만족'}
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="reviewText"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            리뷰 내용
          </label>
          <textarea
            id="reviewText"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent resize-none"
            rows="4"
            placeholder="내용을 입력해주세요..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="flex justify-center space-x-3">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-full transition-colors duration-200"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className={`bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-8 rounded-full transition-colors duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselingReviewModal;
