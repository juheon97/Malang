import React from 'react';

/**
 * 상담사 필터링 컴포넌트
 */
const CounselorFilter = ({ handleFilterChange, isAccessibleMode }) => {
  return (
    <section className="mb-6" aria-labelledby="filter-heading">
      <h2 id="filter-heading" className="sr-only">
        상담사 필터링 옵션
      </h2>

      {isAccessibleMode && (
        // 접근성 모드 필터 UI만 표시
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium border border-green-200 hover:bg-green-100"
            aria-pressed="true"
            onClick={() => handleFilterChange('status', '')}
          >
            모든 상담사
          </button>
          <button
            className="bg-white text-gray-700 px-4 py-2 rounded-full font-medium border border-gray-200 hover:bg-gray-50"
            aria-pressed="false"
            onClick={() => handleFilterChange('status', '가능')}
          >
            현재 가능한 상담사만
          </button>
        </div>
      )}
    </section>
  );
};

export default CounselorFilter;
