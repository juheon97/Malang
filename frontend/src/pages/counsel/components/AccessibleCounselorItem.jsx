import React from 'react';

/**
 * 시각 장애인용 상담사 아이템 컴포넌트
 */
const AccessibleCounselorItem = ({
  counselor,
  expandedCard,
  toggleCardExpand,
  onReviewClick,
  onRequestClick,
}) => {
  return (
    <li
      className={`border rounded-lg overflow-hidden transition-all duration-300 ${
        expandedCard === counselor.id ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${
          counselor.isAvailable ? 'bg-white' : 'bg-gray-50'
        }`}
        onClick={() => toggleCardExpand(counselor.id)}
        tabIndex="0"
        role="button"
        aria-expanded={expandedCard === counselor.id}
        aria-controls={`counselor-details-${counselor.id}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCardExpand(counselor.id);
          }
        }}
      >
        <div className="flex items-center">
          {/* 상담사 가용성 상태 표시 */}
          <div
            className={`w-3 h-3 rounded-full mr-3 ${
              counselor.isAvailable ? 'bg-green-500' : 'bg-gray-400'
            }`}
            aria-hidden="true"
          ></div>

          {/* 상담사 기본 정보 */}
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {counselor.name}
            </h3>
            <p className="text-sm text-gray-600">
              {counselor.title} | 경력 {counselor.personalHistory}
            </p>
          </div>
        </div>

        {/* 가용성 텍스트 및 화살표 */}
        <div className="flex items-center">
          <span
            className={`text-sm mr-3 ${
              counselor.isAvailable ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {counselor.isAvailable ? '상담 가능' : '상담 불가'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedCard === counselor.id ? 'transform rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* 펼쳐진 상세 정보 */}
      {expandedCard === counselor.id && (
        <div id={`counselor-details-${counselor.id}`} className="p-4 border-t">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">상담사 소개</h4>
            <p className="text-gray-700">
              {counselor.bio || counselor.description}
            </p>
          </div>

          <div className="flex items-center mb-4">
            <div className="mr-6">
              <span className="block text-sm text-gray-500">만족도</span>
              <span className="font-semibold">{counselor.satisfaction}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">리뷰</span>
              <button
                className="font-semibold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded"
                onClick={e => {
                  e.stopPropagation();
                  onReviewClick(counselor);
                }}
                aria-label={`${counselor.name}의 리뷰 ${counselor.review_count}개 보기`}
              >
                {counselor.review_count}개 보기
              </button>
            </div>
          </div>

          {/* 상담 요청 버튼 */}
          <div className="flex justify-end">
            <button
              className={`px-6 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                counselor.isAvailable
                  ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
              onClick={e => {
                e.stopPropagation();
                if (counselor.isAvailable) {
                  onRequestClick(counselor);
                }
              }}
              disabled={!counselor.isAvailable}
              aria-label={`${counselor.name}에게 상담 요청하기${!counselor.isAvailable ? ' (현재 불가능)' : ''}`}
            >
              상담 요청
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default AccessibleCounselorItem;
