import React from 'react';

/**
 * 전문 정보 입력 폼 컴포넌트
 */
const ProfileForm = ({ profile, onChange, onSubmit, loading }) => {
  return (
    <div className="md:w-2/3 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">전문 정보</h3>

      <div className="space-y-6">
        {/* 상담 전문 분야 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            상담 전문 분야
          </label>
          <input
            type="text"
            name="speciality"
            value={profile.speciality}
            onChange={onChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
            placeholder="예: 청소년 상담, 가족 상담, 불안장애"
          />
        </div>

        {/* 상담 경력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            상담 경력
          </label>
          <div className="flex items-center">
            <input
              type="number"
              name="years"
              value={profile.years}
              onChange={onChange}
              className="block w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
              min="0"
            />
            <span className="ml-3 text-gray-700">년</span>
          </div>
        </div>

        {/* 자기 소개 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            자기 소개
          </label>
          <div className="relative">
            <textarea
              name="bio"
              value={profile.bio}
              onChange={onChange}
              rows="6"
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
              placeholder="상담에 대한 당신의 접근 방식, 철학, 전문 분야에 대해 설명해주세요. 상담을 찾는 내담자에게 당신을 소개하는 글입니다."
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {profile.bio.length}/500자
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-8 flex justify-end">
        <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md text-sm font-medium mr-3 hover:bg-gray-300 transition-colors">
          취소
        </button>
        <button
          className={`bg-[#00a173] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-[#008d63] transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
