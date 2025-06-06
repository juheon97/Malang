// src/pages/voicechannel/VoiceChannelRoom.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import voiceChannelApi from '../../api/voiceChannelApi';
import useVoiceOpenVidu from '../../hooks/useVoiceOpenVidu';

function VoiceChannelRoom() {
  const { createAndJoinSession } = useVoiceOpenVidu(); // ✅ 컴포넌트 최상위에서 호출

  const [createdChannelId, setCreatedChannelId] = useState(null);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
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

  // currentUser 확인용 로그 추가
  useEffect(() => {
    console.log('현재 로그인된 사용자 정보:', currentUser);
  }, [currentUser]);

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

    // currentUser 확인 로그 추가
    console.log('폼 제출 시 currentUser 정보:', currentUser);
    console.log('현재 사용자 ID:', currentUser?.id);

    // API 명세서에 맞게 데이터 변환
    const apiRequestData = {
      channelName: formData.roomName,
      description: formData.description,
      password: formData.password || null,
      maxPlayer: parseInt(formData.maxUsers),
      user_id: currentUser?.id,
    };
    console.log(
      '1. 방생성 버튼 누르고 : 음성채널 생성 데이터:',
      apiRequestData,
    );

    try {
      // 채널 생성만 시킴
      const channelResponse =
        await voiceChannelApi.createChannel(apiRequestData);
      console.log('백엔드 응답 데이터:', channelResponse.data);
      console.log(
        '방 생성자 ID 확인:',
        channelResponse.data.creatorId || '정보 없음',
      );

      const { channelId, creatorNickname, channelName } = channelResponse.data;

      // 세션 스토리지에 방 생성자 정보 저장 (추가)
      sessionStorage.setItem('isChannelHost', 'true');
      sessionStorage.setItem('channelCreatorId', currentUser?.id);

      // 화면 이동만 수행 (세션 초기화는 다음 페이지에서)
      navigate(`/voice-channel-video/${channelId}`, {
        state: {
          sessionConfig: {
            channelId,
            creatorNickname, // 방장 닉네임 전달
            channelName,
            user_id: currentUser?.id, // 현재 사용자 ID 전달
          },
        },
      });
    } catch (error) {
      console.error('채널 생성 실패:', error);
      console.error('에러 세부 정보:', error.response?.data);

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
              <div className="flex items-center bg-gradient-to-b from-[#E0FEE0] to-[#B0DAAF] rounded-lg shadow-md p-3 cursor-pointer transition-transform hover:scale-105">
                <div className="text-green-600 mr-2">✓</div>
                <span className="text-sm font-semibold text-gray-700">
                  음성 채널
                </span>
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
                음성채널 생성
                <div className="absolute w-12 h-1 bg-[#3FB06C] bottom-0 left-0 rounded-full"></div>
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 방 이름 입력란이 md 이상에서 두 열을 모두 차지하도록 수정 */}
                <div className="md:col-span-2">
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
                    placeholder="음성채널 공간의 이름을 지어주세요"
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
                  placeholder="방 설명을 입력해주세요."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CCA88] transition-all min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-3">
                {error && (
                  <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white font-semibold shadow-lg px-14 py-3 rounded-2xl text-base transition-all transform hover:scale-105 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>처리 중...</span>
                  ) : (
                    <>
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
                      음성채널 생성하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceChannelRoom;
