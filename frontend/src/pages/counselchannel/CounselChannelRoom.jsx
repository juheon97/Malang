import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import counselorChannel from '../../api/counselorChannel';
import axios from 'axios';

function CounselChannelRoom() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: '',
    password: '',
    description: '',
    maxUsers: '1', // 일반상담 기본값 1로 변경
    roomType: '일반상담', // 기본 방 유형
  });

  // 방 타입에 따른 최대 인원 처리
  useEffect(() => {
    // 일반상담은 최대 1명, 그룹상담은 최대 3명으로 설정
    const maxAllowed = formData.roomType === '일반상담' ? 1 : 3;

    // 현재 설정된 인원수가 허용 범위를 벗어나면 조정
    if (parseInt(formData.maxUsers) > maxAllowed) {
      setFormData(prev => ({ ...prev, maxUsers: maxAllowed.toString() }));
    }
  }, [formData.roomType]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const increaseMaxUsers = () => {
    const maxAllowed = formData.roomType === '일반상담' ? 1 : 3;
    setFormData(prev => ({
      ...prev,
      maxUsers: Math.min(parseInt(prev.maxUsers) + 1, maxAllowed).toString(),
    }));
  };

  const decreaseMaxUsers = () => {
    setFormData(prev => ({
      ...prev,
      maxUsers: Math.max(parseInt(prev.maxUsers) - 1, 1).toString(),
    }));
  };

  // 방 타입 변경 핸들러
  const handleRoomTypeChange = roomType => {
    const maxAllowed = roomType === '일반상담' ? 1 : 3;
    setFormData(prev => ({
      ...prev,
      roomType,
      // 방 타입에 맞게 최대 인원 자동 조정
      maxUsers: Math.min(parseInt(prev.maxUsers), maxAllowed).toString(),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('상담채널 생성 데이터:', formData);

    try {
      // 토큰 확인
      const token = sessionStorage.getItem('token');
      console.log('현재 토큰:', token);

      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 채널 타입 변환 (일반상담 -> NORMAL, 그룹상담 -> GROUP)
      const channelType = formData.roomType === '일반상담' ? 'NORMAL' : 'GROUP';

      // API 요청 데이터 구성
      const channelData = {
        channelName: formData.roomName,
        maxPlayer: parseInt(formData.maxUsers),
        channelType: channelType,
        description: formData.description || '',
      };

      console.log('API 요청 데이터:', channelData);

      // API 호출 - 올바른 엔드포인트 사용
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/channels/counseling/create`,
        channelData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('채널 생성 성공:', response.data);

      // 세션 스토리지에 채널 정보 저장 (선택사항)
      sessionStorage.setItem('currentChannel', JSON.stringify(response.data));

      // 생성된 채널 ID로 이동 (URL 파라미터 사용)
      navigate(`/counsel-channel-video/${response.data.channelId}`);
    } catch (error) {
      console.error('채널 생성 실패:', error);

      // 오류 메시지 표시
      let errorMessage = '상담 채널 생성에 실패했습니다.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 401) {
        errorMessage = '인증에 실패했습니다. 다시 로그인해주세요.';
      }

      alert(errorMessage);
    }
  };

  // const handleSubmit = e => {
  //   e.preventDefault();
  //   console.log('상담채널 생성 데이터:', formData);
  //   // API 호출 로직 추가
  //   navigate('/counsel-channel-video');
  // };

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

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* 방 유형 선택 */}
          <div className="w-full md:w-48 bg-white rounded-lg p-4 shadow-md h-fit border border-[#e0e0e0]">
            <h3 className="text-gray-700 font-semibold mb-4">방 유형</h3>

            <div className="space-y-3">
              <div
                className={`flex items-center ${
                  formData.roomType === '일반상담'
                    ? 'bg-gradient-to-b from-[#E0FEE0] to-[#B0DAAF]'
                    : 'bg-white border border-gray-200'
                } rounded-lg shadow-md p-3 cursor-pointer transition-transform hover:scale-105`}
                onClick={() => handleRoomTypeChange('일반상담')}
              >
                <div
                  className={`${formData.roomType === '일반상담' ? 'text-green-600' : 'text-gray-400'} mr-2`}
                >
                  {formData.roomType === '일반상담' ? '✓' : '○'}
                </div>
                <span
                  className={`text-sm ${formData.roomType === '일반상담' ? 'font-semibold text-gray-700' : 'text-gray-600'}`}
                >
                  일반 상담
                </span>
              </div>

              <div
                className={`flex items-center ${
                  formData.roomType === '그룹상담'
                    ? 'bg-gradient-to-b from-[#E0FEE0] to-[#B0DAAF]'
                    : 'bg-white border border-gray-200'
                } rounded-lg p-3 cursor-pointer transition-all hover:bg-[#f0f9f4] hover:shadow-md`}
                onClick={() => handleRoomTypeChange('그룹상담')}
              >
                <div
                  className={`${
                    formData.roomType === '그룹상담'
                      ? 'text-green-600'
                      : 'text-gray-400'
                  } mr-2`}
                >
                  {formData.roomType === '그룹상담' ? '✓' : '○'}
                </div>
                <span
                  className={`text-sm ${formData.roomType === '그룹상담' ? 'font-semibold text-gray-700' : 'text-gray-600'}`}
                >
                  그룹 상담
                </span>
              </div>
            </div>

            {/* 시각적 요소 추가 */}
            <div className="mt-6 bg-[#f5fbf7] rounded-lg p-3 border border-dashed border-[#b0daaf]">
              <p className="text-xs text-gray-600">
                <span className="block font-medium text-[#3FB06C] mb-1">
                  TIP
                </span>
                {formData.roomType === '일반상담'
                  ? '일반 상담은 1:1 상담으로 제한됩니다.'
                  : '그룹 상담은 최대 3명까지 참여할 수 있습니다.'}
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
                        className={`text-xs px-2 ${parseInt(formData.maxUsers) >= (formData.roomType === '일반상담' ? 1 : 3) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#3FB06C]'} leading-none`}
                        onClick={increaseMaxUsers}
                        disabled={
                          parseInt(formData.maxUsers) >=
                          (formData.roomType === '일반상담' ? 1 : 3)
                        }
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className={`text-xs ${parseInt(formData.maxUsers) <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#3FB06C]'} leading-none`}
                        onClick={decreaseMaxUsers}
                        disabled={parseInt(formData.maxUsers) <= 1}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {formData.roomType === '일반상담'
                      ? '일반 상담은 최대 1명까지 가능합니다.'
                      : '그룹 상담은 최대 3명까지 가능합니다.'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white font-semibold shadow-lg px-5 py-3 rounded-2xl text-base transition-all transform hover:scale-105 flex items-center"
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
              채널을 생성하면 상담사님만의 공간이 만들어집니다. 일반 상담은
              1:1로, 그룹 상담은 최대 3명까지 참여할 수 있으며, 입장 요청을 수락
              혹은 거절할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CounselChannelRoom;
