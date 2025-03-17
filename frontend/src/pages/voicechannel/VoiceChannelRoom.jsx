import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VoiceChannelForm() {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [formData, setFormData] = useState({
    roomName: '',
    password: '',
    description: '',
    maxUsers: '4',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const increaseMaxUsers = () => {
    setFormData((prev) =>
      ({ ...prev, maxUsers: Math.min(parseInt(prev.maxUsers) + 1, 4).toString() })
    );
  };

  const decreaseMaxUsers = () => {
    setFormData((prev) =>
      ({ ...prev, maxUsers: Math.max(parseInt(prev.maxUsers) - 1, 1).toString() })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('음성채널 생성 데이터:', formData);
    // API 호출 로직 추가
    navigate('/voice-channel-video'); // 경로 변경
  };

  return (
    <div className="flex justify-center items-center p-4  mt-8">
      <div className="w-full max-w-4xl bg-[#EFF5F2] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 방 유형 선택 */}
          <div className="w-full md:w-48 bg-[#f8f8f8] rounded-lg p-4 shadow-md h-fit">
            <h3 className="text-gray-700 font-semibold mb-4">방 유형</h3>
            <div className="flex items-center bg-gradient-to-b from-[#E0FEE0] to-[#B0DAAF] rounded-lg shadow-md p-2 cursor-pointer">
              <div className="text-green-600 mr-2">✓</div>
              <span className="text-sm font-semibold text-gray-700 ">음성채널</span>
            </div>
          </div>

          {/* 음성채널 생성 폼 */}
          <div className="flex-1 bg-[#f8f8f8] rounded-lg p-6 shadow-lg">
            <h1
              style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
              className="text-2xl font-bold text-gray-800 relative mb-12 mt-3"
            >
              음성채널 생성
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label htmlFor="roomName" className="block text-base font-semibold text-gray-600 mb-3">방 이름</label>
                  <input
                    type="text"
                    id="roomName"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block font-semibold text-base text-gray-600 mb-3">비밀번호</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="description" className="block font-semibold text-base text-gray-600 mb-3">방 설명 (선택사항)</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <label htmlFor="maxUsers" className="block font-semibold text-base text-gray-600 mb-3">최대 인원</label>
                  <div className="flex bg-white items-center border border-gray-200 rounded-xl p-1.5 w-fit ">
                    <span className="mr-3 text-base px-2 py-1">{formData.maxUsers}명</span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="text-xs px-2 text-gray-500 hover:text-gray-700 leading-none"
                        onClick={increaseMaxUsers}
                      >▲</button>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-gray-700 leading-none"
                        onClick={decreaseMaxUsers}
                      >▼</button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white font-semibold shadow-lg px-16 py-2 rounded-2xl text-base transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceChannelForm;
