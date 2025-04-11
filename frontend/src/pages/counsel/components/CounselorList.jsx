import React from 'react';
import CounselorCard from './CounselorCard';
import AccessibleCounselorItem from './AccessibleCounselorItem';

/**
 * 상담사 목록 컴포넌트
 */
const CounselorList = ({
  counselors,
  isAccessibleMode,
  expandedCard,
  toggleCardExpand,
  onReviewClick,
  onBioClick,
  onRequestClick,
}) => {
  return (
    <section aria-labelledby="counselors-heading">
      <h2
        id="counselors-heading"
        className={`${isAccessibleMode ? 'text-xl' : 'text-lg'} font-bold mb-4 text-gray-800`}
      >
        상담사 목록 ({counselors.length}명)
      </h2>

      {isAccessibleMode ? (
        // 접근성 모드 목록 UI
        <ul className="space-y-4">
          {counselors.map(counselor => (
            <AccessibleCounselorItem
              key={counselor.id}
              counselor={counselor}
              expandedCard={expandedCard}
              toggleCardExpand={toggleCardExpand}
              onReviewClick={onReviewClick}
              onRequestClick={onRequestClick}
            />
          ))}
        </ul>
      ) : (
        // 일반 모드 목록 UI
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {counselors.map(counselor => (
            <CounselorCard
              key={counselor.id}
              counselor={counselor}
              onReviewClick={onReviewClick}
              onBioClick={onBioClick}
              onRequestClick={onRequestClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CounselorList;
