import React, { useState, useEffect, useMemo, useRef } from 'react';
import VoiceChannelList from '../../components/voicechannel/VoiceChannelList';
import voiceChannelApi from '../../api/voiceChannelApi';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import PasswordModal from '../../components/modal/PasswordModal';
import WaitingModal from '../../components/modal/WaitingModal';
import useOpenVidu from '../../hooks/useOpenvidu';

const VoiceChannel = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { joinExistingSession } = useOpenVidu();

  // 모달 관련 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const { isAccessibleMode, setAccessibleMode } = useAccessibility();
  const [currentChannelId, setCurrentChannelId] = useState(null);

  // 모달용 포커스 관리
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // 세션 스토리지에서 시각장애인 설정 확인
  useEffect(() => {
    const userSettings = JSON.parse(
      sessionStorage.getItem('userSettings') || '{}',
    );

    if (userSettings.isVisuallyImpaired === false) {
      setAccessibleMode(false);
    } else if (userSettings.isVisuallyImpaired === true) {
      setAccessibleMode(true);
    }
  }, [setAccessibleMode]);

  // 채널 목록 가져오기
  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const data = await voiceChannelApi.listChannels();
      console.log('채널 목록:', data);
      setChannels(data);
      setError(null);
    } catch (error) {
      console.error('채널 목록 조회 실패:', error);
      setError('채널 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);


  // 검색어에 따라 필터링된 채널 목록 계산
  const filteredChannels = useMemo(() => {
    console.log('검색어:', searchInput);
    console.log('전체 채널 목록:', channels);
    if (searchInput.trim() === '') {
      return channels;
    } else {
      return channels.filter(channel =>
        channel.channelName.toLowerCase().includes(searchInput.toLowerCase()),
      );
    }
  }, [searchInput, channels]);

  const handleSearch = e => {
    e.preventDefault();
    console.log('검색어:', searchInput);

    // 접근성 모드에서 검색 결과 알림
    if (isAccessibleMode) {
      const resultCount = filteredChannels.length;
      const resultMessage = `검색 결과: ${resultCount}개의 채널이 있습니다.`;

      // 스크린 리더에게 검색 결과 알림
      const liveRegion = document.getElementById('search-results-live');
      if (liveRegion) {
        liveRegion.textContent = resultMessage;
      }
    }
  };


  // 채널 참여 버튼 클릭 시
const handleJoinChannel = async (channel) => {
  console.log('채널 참여:', channel);

  // 접근성 모드인 경우 현재 포커스 요소 저장
  if (isAccessibleMode) {
    previousFocusRef.current = document.activeElement;
  }

  // 참여자 정보 저장
  sessionStorage.setItem('isChannelHost', 'false');

  // 채널이 잠겨있는지 확인 (비밀번호 필요 여부)
  if (channel.hasPassword) {
    // 비밀번호가 필요한 채널인 경우
    setCurrentChannelId(channel.channelId);
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError('');

    // 접근성 모드에서 모달에 포커스
    if (isAccessibleMode) {
      setTimeout(() => {
        if (modalRef.current) modalRef.current.focus();
      }, 100);
    }
  } else {
    try {
      // OpenVidu 세션 참여
      await joinExistingSession(channel.channelId);
      // 화상 채팅 페이지로 이동
      console.log(`비밀번호 없는 채널 ${channel.channelId} 입장`);
      navigate(`/voice-channel-video/${channel.channelId}`);
    } catch (error) {
      console.error('채널 참여 오류:', error);
      setError('채널 참여 중 오류가 발생했습니다.');
    }
  }
};

   

  // 비밀번호 제출 처리
  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    // 요청 전 데이터 확인
    console.log('요청할 데이터:', {
      channelId: currentChannelId,
      password: passwordInput,
    });

    try {
      const isPasswordCorrect = await voiceChannelApi.checkChannelPassword(
        currentChannelId,
        passwordInput,
      );

      if (isPasswordCorrect) {
        try {
          // OpenVidu 세션 참여
          await joinExistingSession(currentChannelId);
        // 비밀번호가 맞으면 채널로 이동
        // navigate(`/voice-channel-video/${currentChannelId}`);
        setShowPasswordModal(false);
        setPasswordInput('');
        // 방장 수락 대기 모달 표시
        setShowWaitingModal(true);
        // 서버에 비밀번호 검증 및 방장에게 요청을 보내는 로직 필요
        console.log(`채널 ${currentChannelId} 비밀번호 제출 후 방장 수락 대기`);
      } catch (error){
        console.error('Password submission failed:', error);
        setPasswordError(
          error.message || '비밀번호 확인 중 오류가 발생했습니다.');
        }
        } else{
        // 비밀번호가 틀리면 오류 메시지 표시
        setPasswordError('비밀번호가 올바르지 않습니다. 다시 시도해주세요.');
      } 
    } catch (error) {
      console.error('Password submission failed:', error);
      setPasswordError(
        error.message || '비밀번호 확인 중 오류가 발생했습니다.'
      );
    }
    
    console.log(passwordInput);
  };
  // 모달 닫기
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setShowWaitingModal(false);
    setPasswordInput('');
    setPasswordError('');
    // 접근성 모드
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };


  // 대기 취소
  const handleCancelWaiting = () => {
    setShowWaitingModal(false);
    console.log('입장 요청 취소');

    // 접근성 모드에서 이전 포커스 요소로 돌아가기
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  // 모달 닫기 (모든 모달을 닫는 통합 함수)
  const closeModal = () => {
    setShowPasswordModal(false);
    setShowWaitingModal(false);

    // 접근성 모드에서 이전 포커스 요소로 돌아가기
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  // 채널 확장/축소 토글 (시각장애인 모드)
  const toggleChannelExpand = channelId => {
    console.log('확장된 채널 ID:', channelId);
    setExpandedChannel(expandedChannel === channelId ? null : channelId);
  };

  // 새로 고침 버튼 클릭 시
  const handleRefresh = () => {
    fetchChannels();
  };

  // 원형 그라데이션
  const pageStyle = {
    backgroundImage: `
      radial-gradient(circle at 10% 30%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 15%),
      radial-gradient(circle at 30% 18%, rgba(233, 230, 47, 0.2) 0%, rgba(255, 255, 255, 0) 15%),
      radial-gradient(circle at 80% 80%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
      radial-gradient(circle at 10% 90%, rgba(200, 230, 255, 0.1) 0%, rgba(255, 255, 255, 0) 20%)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-white" style={pageStyle}>
       <div className="w-full bg-white py-"></div>
      <div className="w-full bg-transparent py-12">
        <main className="max-w-6xl mx-auto px-6 relative">
          {/* 방 생성 버튼 */}
          <div className="absolute top-0 right-36">
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
              onClick={() => navigate('/voice-channel-room')}
            >
              방 생성
            </button>   
          </div>
          <div className ="absolute top-0 right-6">
            {/* 새로 고침 버튼 */}
            <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
                  >
                    새로 고침
                  </button>
                  </div>

{/* 제목 */}
<header className="text-center mb-10">
            <h1
              style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
              className="text-4xl font-bold text-[#00a173]"
              tabIndex={isAccessibleMode ? '0' : undefined}
            >
              음성채널
            </h1>
          </header>

          {/* 시각장애인 모드에서 페이지 설명 */}
          {isAccessibleMode && (
            <p className="sr-only">
              이 페이지에서는 다양한 음성 채널을 찾고 참여할 수 있습니다.
              검색창을 통해 원하는 채널을 찾거나, 목록에서 채널을 선택하여
              입장할 수 있습니다. 잠금 표시가 있는 채널은 비밀번호가 필요합니다.
            </p>
          )}

         {/* 검색창 */}
         <div className="mb-12 flex justify-left">
            <div className="bg-white p-2 rounded-xl shadow-md w-full max-w-md">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <label
                    htmlFor="channel-search"
                    className={isAccessibleMode ? 'sr-only' : 'hidden'}
                  >
                    채널 검색
                  </label>
                  <input
                    id="channel-search"
                    type="text"
                    placeholder="방을 검색하세요..."
                    className="w-full py-2 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4DC0B5] focus:ring-2 focus:ring-[#4DC0B5] focus:ring-opacity-20 text-sm"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    aria-label={
                      isAccessibleMode ? '방 이름으로 검색' : undefined
                    }
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-3 py-1.5 rounded-lg shadow-md transition duration-200 text-xs"
                    aria-label={isAccessibleMode ? '검색 실행' : undefined}
                  >
                    검색
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 스크린 리더를 위한 검색 결과 알림 영역 */}
          {isAccessibleMode && (
            <div
              id="search-results-live"
              aria-live="polite"
              className="sr-only"
            ></div>
          )}

            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div className="relative flex-grow sm:flex-grow-0">
                  </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">채널 목록을 불러오는 중...</p>
                </div>
              ) : error ? (
                <div
                  className="text-center py-10 bg-white rounded-xl shadow-md"
                  role="alert"
                >
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <VoiceChannelList
                  channels={filteredChannels}
                  isAccessibleMode={isAccessibleMode}
                  onJoinChannel={handleJoinChannel}
                  onToggleExpand={toggleChannelExpand}
                  expandedChannel={expandedChannel}
                />
              )}
              {/* 비밀번호 모달 */}
              <PasswordModal
                isOpen={showPasswordModal}
                onClose={handleCloseModal}
                passwordInput={passwordInput}
                setPasswordInput={setPasswordInput}
                onSubmit={handlePasswordSubmit}
              />
            </div>
        </main>
      </div>
       {/* 모달 컴포넌트 */}
       {showPasswordModal && (
        <div
          ref={isAccessibleMode ? modalRef : null}
          role={isAccessibleMode ? 'dialog' : undefined}
          aria-modal={isAccessibleMode ? 'true' : undefined}
          aria-label={isAccessibleMode ? '채널 비밀번호 입력' : undefined}
          tabIndex={isAccessibleMode ? '-1' : undefined}
        >
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            onSubmit={handlePasswordSubmit}
          />
        </div>
      )}

      {showWaitingModal && (
        <div
          ref={isAccessibleMode ? modalRef : null}
          role={isAccessibleMode ? 'dialog' : undefined}
          aria-modal={isAccessibleMode ? 'true' : undefined}
          aria-label={isAccessibleMode ? '방장 수락 대기 중' : undefined}
          tabIndex={isAccessibleMode ? '-1' : undefined}
          aria-live={isAccessibleMode ? 'assertive' : undefined}
        >
          <WaitingModal
            isOpen={showWaitingModal}
            onCancel={handleCancelWaiting}
            waitingFor="방장"
            title="수락을 기다려주세요..."
          />
        </div>
      )}
    </div>
  );
};

export default VoiceChannel;