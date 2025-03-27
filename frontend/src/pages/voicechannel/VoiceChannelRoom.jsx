import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mockApi from '../../api/mockApi';
import { useAuth } from '../../contexts/AuthContext'; // AuthContext import

function VoiceChannelForm() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth(); // 인증 정보 가져오기
  const [formData, setFormData] = useState({
    roomName: '',
    password: '',
    description: '',
    maxUsers: '4',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
      navigate('/login', { state: { from: '/voice-channel-form' } });
    }
  }, [isAuthenticated, navigate]);

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

  const handleSubmit = async e => {
    e.preventDefault();

    // 인증 확인
    if (!isAuthenticated) {
      setError('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // API 명세서에 맞게 데이터 변환
    const apiRequestData = {
      channel_name: formData.roomName,
      channel_description: formData.description,
      password: formData.password || null,
      max_player: parseInt(formData.maxUsers),
    };

    // 백엔드로 전송되는 데이터 확인을 위한 콘솔 로그
    console.log('=== 백엔드로 전송되는 데이터 ===');
    console.log('요청 URL:', '/api/create/talkChannel');
    console.log('요청 메서드:', 'POST');
    console.log('요청 본문:', apiRequestData);

    try {
      // 토큰 가져오기
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 요청 헤더 확인을 위한 콘솔 로그
      console.log('요청 헤더:', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      // API 호출
      const response = await mockApi.post(
        '/api/create/talkChannel',
        apiRequestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 응답 데이터 확인을 위한 콘솔 로그
      console.log('=== 백엔드 응답 데이터 ===');
      console.log('응답 상태 코드:', response.status);
      console.log('응답 데이터:', response.data);

      console.log('채널 생성 성공:', response.data);

      // OpenVidu 세션 생성 요청
      const sessionResponse = await mockApi.post(
        '/openvidu/api/sessions',
        {
          sessionId: response.data.data.channel_id,
          customSessionId: response.data.data.channel_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('OpenVidu 세션 생성 성공:', sessionResponse.data);

      // 토큰 생성 요청
      const tokenResponse = await mockApi.post(
        `/openvidu/api/sessions/${response.data.data.channel_id}/connection`,
        {
          role: 'PUBLISHER', // 방 생성자는 PUBLISHER 역할
          data: JSON.stringify({
            userId: currentUser.id,
            username: currentUser.username,
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('OpenVidu 토큰 생성 성공:', tokenResponse.data);

      // 세션 정보와 토큰을 저장
      sessionStorage.setItem(
        'openviduSessionId',
        response.data.data.channel_id,
      );
      sessionStorage.setItem('openviduToken', tokenResponse.data.token);

      // 생성 성공 시 채널 ID를 가지고 다음 페이지로 이동
      navigate(`/voice-channel-video/${response.data.data.channel_id}`);
    } catch (error) {
      console.error('채널 생성 실패:', error);

      // 에러 처리
      if (error.response) {
        // 서버 응답이 있는 경우
        setError(error.response.data.message || '채널 생성에 실패했습니다.');

        // 토큰 만료 에러인 경우 (401 Unauthorized)
        if (error.response.status === 401) {
          // 로그인 페이지로 리다이렉트하거나 토큰 갱신 로직 실행
          navigate('/login', { state: { from: '/voice-channel-form' } });
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답이 없는 경우
        setError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        // 요청 설정 중 오류 발생
        setError('요청 중 오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        인증이 필요합니다...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4 mt-8">
      {/* 기존 UI 코드 유지 */}
      <div className="w-full max-w-4xl bg-[#EFF5F2] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 방 유형 선택 */}
          <div className="w-full md:w-48 bg-[#f8f8f8] rounded-lg p-4 shadow-md h-fit">
            <h3 className="text-gray-700 font-semibold mb-4">방 유형</h3>
            <div className="flex items-center bg-gradient-to-b from-[#E0FEE0] to-[#B0DAAF] rounded-lg shadow-md p-2 cursor-pointer">
              <div className="text-green-600 mr-2">✓</div>
              <span className="text-sm font-semibold text-gray-700">
                음성채널
              </span>
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

            {/* 에러 메시지 표시 */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 기존 폼 필드 유지 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label
                    htmlFor="roomName"
                    className="block text-base font-semibold text-gray-600 mb-3"
                  >
                    방 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block font-semibold text-base text-gray-600 mb-3"
                  >
                    비밀번호
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="선택사항"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="description"
                  className="block font-semibold text-base text-gray-600 mb-3"
                >
                  방 설명 (선택사항)
                </label>
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
                  <label
                    htmlFor="maxUsers"
                    className="block font-semibold text-base text-gray-600 mb-3"
                  >
                    최대 인원 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex bg-white items-center border border-gray-200 rounded-xl p-1.5 w-fit">
                    <span className="mr-3 text-base px-2 py-1">
                      {formData.maxUsers}명
                    </span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="text-xs px-2 text-gray-500 hover:text-gray-700 leading-none"
                        onClick={increaseMaxUsers}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-gray-700 leading-none"
                        onClick={decreaseMaxUsers}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white font-semibold shadow-lg px-16 py-2 rounded-2xl text-base transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? '생성 중...' : '생성'}
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
