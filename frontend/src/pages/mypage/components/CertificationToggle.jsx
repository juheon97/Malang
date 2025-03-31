import React from 'react';

/**
 * 자격증 상태 토글 컴포넌트
 */
const CertificationToggle = ({ hasCertification, onToggle, isUpdating }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">자격증</span>
      <div className="flex items-center">
        {hasCertification ? (
          <div className="flex items-center">
            <span className="text-[#00a173] font-medium mr-2">보유</span>
            <button
              onClick={() => onToggle(false)}
              disabled={isUpdating}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '업데이트 중...' : '자격증 제거'}
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-gray-500 font-medium mr-2">미보유</span>
            <button
              onClick={() => onToggle(true)}
              disabled={isUpdating}
              className="text-xs bg-[#00a173] text-white px-2 py-1 rounded hover:bg-[#008d63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '업데이트 중...' : '자격증 추가'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationToggle;
