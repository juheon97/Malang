import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import counselorChannel from '../../api/counselorChannel';
import axios from 'axios';
import counselWebSocketService from '../../services/counselwebsocketService';

function CounselChannelRoom() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: '',
    password: '',
    description: '',
    maxUsers: '1', // 항상 1로 고정
  });

  // 디버깅용 useEffect
  useEffect(() => {
    // 환경 변수 확인
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('웹소켓 URL:', `${import.meta.env.VITE_API_URL}/ws`);

    // 로그인 상태 확인
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userRole = sessionStorage.getItem('userRole');

    console.log('===== 디버깅 정보 =====');
    console.log('로그인 토큰 존재 여부:', !!token);
    console.log(
      '토큰 일부 (보안상 전체 표시 안함):',
      token ? `${token.substring(0, 15)}...` : 'null',
    );
    console.log('사용자 정보:', user);
    console.log('사용자 역할:', userRole);
    console.log('=======================');
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('상담채널 생성 데이터:', formData);

    try {
      // 토큰 확인 강화
      const token = sessionStorage.getItem('token');
      console.log(
        '현재 토큰:',
        token ? `${token.substring(0, 15)}...` : 'null',
      );

      // 토큰이 없거나 비어있으면 재로그인 안내
      if (!token || token.trim() === '') {
        alert('인증 정보가 없습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트
        navigate('/login');
        return;
      }

      // 채널 타입은 항상 NORMAL로 설정
      const channelType = 'NORMAL';

      // API 요청 데이터 구성
      const channelData = {
        channelName: formData.roomName,
        maxPlayer: 1, // 항상 1로 고정
        channelType: channelType,
        description: formData.description || '',
      };

      console.log('===== API 요청 정보 =====');
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      console.log('API 기본 URL:', API_BASE_URL);
      console.log('요청 엔드포인트:', `${API_BASE_URL}/counselor/profile/1`);
      console.log('요청 데이터:', channelData);
      console.log('=========================');

      const response = await axios.put(
        `${API_BASE_URL}/counselor/profile/1`,
        channelData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(`요청한 URL: ${API_BASE_URL}/counselor/profile/1`);
      console.log('채널 생성 응답 상태:', response.status);
      console.log('채널 생성 응답 데이터:', response.data);

      // PUT 응답 후, 백엔드에서 가공된 counselorCode를 GET API를 통해 받아옴
      const profileResponse = await axios.get(
        `${API_BASE_URL}/counselor/profile`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('프로필 응답 데이터:', profileResponse.data);

      let counselorCode = null;
      if (
        profileResponse.data &&
        (profileResponse.data.counselorCode ||
          profileResponse.data.counselor_code)
      ) {
        counselorCode =
          profileResponse.data.counselorCode ||
          profileResponse.data.counselor_code;
      } else {
        alert('상담사 코드를 찾을 수 없습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }

      console.log('사용할 counselor_code:', counselorCode);

      // 세션 스토리지에 채널 정보 저장
      const channelInfo = {
        ...response.data,
        counselorCode: counselorCode,
        status: 'INACTIVE', // 초기 상태
        isActive: false,
      };

      console.log('세션 스토리지에 저장할 채널 정보:', channelInfo);
      sessionStorage.setItem('currentChannel', JSON.stringify(channelInfo));

      // 웹소켓 연결 및 구독 추가
      console.log('===== 웹소켓 연결 시작 =====');
      console.log('웹소켓 URL:', `${API_BASE_URL}/ws`);
      console.log('상담사 코드:', counselorCode);

      const handleAccessCallback = message => {
        console.log('웹소켓 입장 요청 메시지 수신:', message);
      };
      const handleChannelCallback = message => {
        console.log('웹소켓 채널 이벤트 메시지 수신:', message);
      };
      const handleChatCallback = message => {
        console.log('웹소켓 채팅 메시지 수신:', message);
      };

      counselWebSocketService.connect(
        counselorCode,
        handleAccessCallback,
        handleChannelCallback,
        handleChatCallback,
      );

      // setTimeout으로 웹소켓 연결 후 상태를 확인
      setTimeout(() => {
        console.log('===== 웹소켓 연결 상태 확인 =====');
        console.log('연결 여부:', counselWebSocketService.isConnected);
        console.log(
          '스톰프 클라이언트 존재 여부:',
          !!counselWebSocketService.stompClient,
        );
        if (counselWebSocketService.stompClient) {
          console.log(
            '세션 ID:',
            counselWebSocketService.stompClient.sessionId,
          );
        }
        console.log(
          '구독 목록:',
          Array.from(counselWebSocketService.subscriptions.keys()),
        );
        console.log('===============================');
      }, 1000);

      console.log('===========================');

      // counselor_code로 비디오 페이지 이동
      navigate(`/counsel-channel-video/${counselorCode}`);
    } catch (error) {
      console.error('채널 생성 실패:', error);
      console.error('에러 응답 세부 정보:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
      });

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
                  required
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

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-600">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">안내:</span>
                </div>
                <p className="mt-1 ml-7">
                  상담은 1:1 개인 상담으로 진행됩니다.
                </p>
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
              채널을 생성하면 상담사님만의 공간이 만들어집니다. 상담은 1:1 개인
              상담으로 진행되며, 입장 요청을 수락 혹은 거절할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CounselChannelRoom;
