import React from 'react';

const MyPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 mt-16 bg-[#E3EFE5]">
      {/* 상단 프로필 탭 */}
      <div className="mb-6">
        <div className="inline-block bg-white rounded-xl px-8 py-2 w-1/3 border-2 border-[#51C446] text-center shadow-lg">
          <span className="text-[#238836] font-medium">프로필</span>
        </div>
      </div>

      {/* 메인 흰색 박스 - 상단 테두리 추가, 둥근 모서리 제거, 투명도 54% 설정 */}
      <div className="bg-white rounded-none shadow-md p-6 mb-6 border-t-4 border-[#19B13089]">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 왼쪽 영역 - 기본 정보 */}
          <div className="md:w-1/3">
            {/* 프로필 이미지 추가 */}
            <div className="flex justify-center mb-6">
              <img
                src="src/assets/image/mypage/Mypage_profile.svg"
                alt="프로필 이미지"
                className="w-32 h-32"
              />
            </div>
            <div className="text-center mb-4 mt-4">
              <span className="font-medium">성별: </span>
              <span>여자</span>
            </div>
            <div className="text-center mt-2">
              <span className="font-medium">생년월일: </span>
              <span>0000.00.00</span>
            </div>
          </div>

          {/* 오른쪽 영역 - 상담 정보 - 크기 키움 및 그림자 추가 */}
          <div className="md:w-3/4">
            <div className="bg-[#F9F9F9] p-4 rounded-lg shadow-md">
              <div className="mb-4">
                <span className="font-medium">상담 전문 분야: </span>
              </div>
              <div className="mb-4">
                <span className="font-medium">상담 경력: </span>
              </div>
              <div className="mb-2">
                <span className="font-medium">소개: </span>
              </div>

              {/* 소개 아래 텍스트 입력 가능한 흰색 박스 + 그림자 추가 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 h-32 shadow-md">
                <textarea
                  className="w-full h-full resize-none focus:outline-none"
                  placeholder="자기소개를 입력해주세요..."
                />
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
