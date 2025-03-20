import React from 'react';

const MyPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-[#E3EFE5]">
      {/* 상단 프로필 탭 */}
      <div className="mb-6">
        <div className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm">
          <span className="text-[#238836] font-medium">프로필</span>
        </div>
      </div>

      {/* 메인 흰색 박스 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 왼쪽 영역 - 기본 정보 */}
          <div className="md:w-1/3">
            <div className="mb-4">
              <span className="font-medium">성별: </span>
              <span>여자</span>
            </div>
            <div>
              <span className="font-medium">생년월일: </span>
              <span>0000.00.00</span>
            </div>
          </div>

          {/* 오른쪽 영역 - 상담 정보 */}
          <div className="md:w-2/3">
            <div className="bg-[#F9F9F9] p-4 rounded-lg">
              <div className="mb-4">
                <span className="font-medium">상담 전문 분야: </span>
              </div>
              <div className="mb-4">
                <span className="font-medium">상담 경력: </span>
              </div>
              <div className="mb-2">
                <span className="font-medium">소개: </span>
              </div>

              {/* 소개 아래 흰색 박스 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 h-32">
                {/* 소개 내용 들어갈 부분 */}
              </div>
            </div>
          </div>
        </div>
        {/* 저장 버튼 */}
        <div className="flex justify-center mt-6">
          <button className="bg-green-700 text-white py-2 px-8 rounded-full hover:bg-green-800 transition-colors">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
