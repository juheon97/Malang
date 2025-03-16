import React, { useState } from 'react';

const CounselingReviewModal = ({ counselor, onClose, onSubmit }) => {
  const [rating, setRating] = useState(3);  //기본 별점점
  const [reviewText, setReviewText] = useState('');

  // counselor가 없는 경우 상담사로
  const counselorName = counselor?.name || '상담사';

  const handleSubmit = () => {
    onSubmit({ 
      counselorId: counselor?.id, 
      rating, 
      reviewText 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">상담이 종료되었습니다.</h2>
          <p className="text-gray-700">{counselorName} 상담사님을 평가해주세요.</p>
        </div>

        <div className="mb-6">
          <div className="font-bold mb-2">별점</div>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                className={`text-3xl focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent resize-none"
            rows="4"
            placeholder="내용을 입력해주세요... 인생 상담이었어요. 다음 상담에는 100만원만 달라고하시는데 꼭 결제해보려고 해요."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <button 
            className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-8 rounded-full transition-colors duration-200"
            onClick={handleSubmit}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselingReviewModal;