import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CounselChannelRoom() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: '',
    password: '',
    description: '',
    maxUsers: '4',
    roomType: '일반상담', // 기본 방 유형
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const increaseMaxUsers = () => {
    setFormData(prev => ({
      ...prev,
      maxUsers: Math.min(parseInt(prev.maxUsers) + 1, 4).toString(),
    }));
  };

  const decreaseMaxUsers = () => {
    setFormData(prev => ({
      ...prev,
      maxUsers: Math.max(parseInt(prev.maxUsers) - 1, 1).toString(),
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('상담채널 생성 데이터:', formData);
    // API 호출 로직 추가
    navigate('/counsel-channel-video');
  };

  return (
    <div className="flex justify-center items-center p-4 mt-8">
      {/* 물결 배경 디자인 요소 */}
      <div className="absolute top-0 w-full h-96 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#e0f5e9] to-transparent opacity-60"></div>
        <svg viewBox="0 0 1440 320" className="absolute bottom-0">
          <path
            fill="#dcf3e6"
            fillOpacity="0.5"
            d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,186.7C672,192,768,192,864,176C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="w-full max-w-4xl bg-[#EFF5F2] rounded-xl p-6 shadow-xl border border-[#e0f5e9] relative">
        {/* 상단 배지 */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] text-white px-6 py-2 rounded-full shadow-md">
          <span className="font-semibold">
            새로운 상담 공간을 만들어보세요!
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* 방 유형 선택 */}
          <div className="w-full md:w-48 bg-white rounded-lg p-4 shadow-md h-fit border border-[#e0e0e0]">
            <h3 className="text-gray-700 font-semibold mb-4">방 유형</h3>

            <div className="space-y-3">
              <div className="flex items-center bg-gradient-to-b from-[#E0FEE0] to-[#B0DAAF] rounded-lg shadow-md p-3 cursor-pointer transition-transform hover:scale-105">
                <div className="text-green-600 mr-2">✓</div>
                <span className="text-sm font-semibold text-gray-700">
                  일반 상담
                </span>
              </div>

              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:bg-[#f0f9f4] hover:shadow-md">
                <div className="text-gray-400 mr-2">○</div>
                <span className="text-sm text-gray-600">그룹 상담</span>
              </div>

              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:bg-[#f0f9f4] hover:shadow-md">
                <div className="text-gray-400 mr-2">○</div>
                <span className="text-sm text-gray-600">특화 상담</span>
              </div>
            </div>

            {/* 시각적 요소 추가 */}
            <div className="mt-6 bg-[#f5fbf7] rounded-lg p-3 border border-dashed border-[#b0daaf]">
              <p className="text-xs text-gray-600">
                <span className="block font-medium text-[#3FB06C] mb-1">
                  TIP
                </span>
                방 유형에 따라 필요한 설정이 달라질 수 있어요.
              </p>
            </div>
          </div>

          {/* 상담채널 생성 폼 */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow-lg border border-[#e0e0e0]">
            <div className="relative">
              <h1
                style={{
                  fontFamily: "'HancomMalangMalang-Regular', sans-serif",
                }}
                className="text-2xl font-bold text-gray-800 mb-8 mt-2 pb-3 border-b-2 border-[#5CCA88]"
              >
                상담채널 생성
                <div className="absolute w-12 h-1 bg-[#3FB06C] bottom-0 left-0 rounded-full"></div>
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div>
                  <label
                    htmlFor="roomName"
                    className="block text-base font-semibold text-gray-600 mb-3 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-[#3FB06C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      ></path>
                    </svg>
                    방 이름
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleChange}
                    placeholder="상담 공간의 이름을 지어주세요"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CCA88] transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block font-semibold text-base text-gray-600 mb-3 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2 text-[#3FB06C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                  방 설명 (선택사항)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="어떤 상담이 이루어질지 설명해주세요"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CCA88] transition-all min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label
                    htmlFor="maxUsers"
                    className="block font-semibold text-base text-gray-600 mb-3 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-[#3FB06C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      ></path>
                    </svg>
                    최대 인원
                  </label>
                  <div className="flex bg-white items-center border border-gray-200 rounded-xl p-2 w-fit shadow-sm hover:shadow transition-shadow">
                    <span className="mr-3 text-base px-3 py-1 bg-[#f0f9f4] rounded-lg">
                      {formData.maxUsers}명
                    </span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="text-xs px-2 text-gray-500 hover:text-[#3FB06C] leading-none"
                        onClick={increaseMaxUsers}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-[#3FB06C] leading-none"
                        onClick={decreaseMaxUsers}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="roomType"
                    className="block font-semibold text-base text-gray-600 mb-3 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-[#3FB06C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      ></path>
                    </svg>
                    상담 카테고리
                  </label>
                  <select
                    id="roomType"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CCA88] transition-all bg-white"
                  >
                    <option value="일반상담">일반 상담</option>
                    <option value="가족상담">가족 상담</option>
                    <option value="학업상담">학업 상담</option>
                    <option value="대인관계">대인관계</option>
                    <option value="직장생활">직장 생활</option>
                  </select>
                </div>
              </div>

              {/* 방 설정 추가 옵션 */}
              <div className="mb-8 bg-[#f9fcfa] p-4 rounded-lg border border-[#e0e0e0]">
                <p className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <svg
                    className="w-5 h-5 mr-2 text-[#3FB06C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  추가 설정
                </p>

                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-[#5CCA88] transition-all">
                    <input
                      type="checkbox"
                      className="form-checkbox text-[#3FB06C] rounded"
                    />
                    <span className="text-sm text-gray-700">비밀번호 설정</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-[#5CCA88] transition-all">
                    <input
                      type="checkbox"
                      className="form-checkbox text-[#3FB06C] rounded"
                    />
                    <span className="text-sm text-gray-700">
                      입장 승인 필요
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-[#5CCA88] transition-all">
                    <input
                      type="checkbox"
                      className="form-checkbox text-[#3FB06C] rounded"
                    />
                    <span className="text-sm text-gray-700">
                      채팅 기능 활성화
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white font-semibold shadow-lg px-14 py-3 rounded-2xl text-base transition-all transform hover:scale-105 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  상담방 생성하기
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 하단 도움말 섹션 */}
        <div className="mt-6 bg-white p-4 rounded-lg border border-[#e0e0e0] text-sm text-gray-600">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-[#3FB06C] mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p>
              <span className="font-medium text-gray-700">도움말:</span> 상담
              채널을 생성하면 상담사님만의 공간이 만들어집니다. 최대 4명까지
              참여할 수 있으며, 필요에 따라 비밀번호를 설정하여 보안을 강화할 수
              있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CounselChannelRoom;
