import React, { useState, useMemo, useRef } from 'react';
import PasswordModal from '../../components/modal/PasswordModal';
import WaitingModal from '../../components/modal/WaitingModal';
import { useNavigate } from 'react-router-dom';

const VoiceChannel = () => {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [expandedChannel, setExpandedChannel] = useState(null);

  // 모달용 포커스 관리
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // 시각장애인 모드 토글
  const toggleAccessibleMode = () => {
    setIsAccessibleMode(!isAccessibleMode);
    // 모드 전환 시 펼쳐진 채널 초기화
    setExpandedChannel(null);
  };

  // 채널 데이터 useMemo로 메모이제이션
  const channels = useMemo(
    () => [
      {
        id: 1,
        title: '백종원의 요리교실',
        participants: 5,
        description: '요리에 관한 이야기를 나누는 채널입니다.',
      },
      {
        id: 2,
        title: '피그마로 수다떨어요',
        isLocked: true,
        description: '디자인 툴 피그마에 관한 사용법을 공유합니다.',
      },
      {
        id: 3,
        title: '스탠리',
        participants: 3,
        description: '영화와 드라마에 관한 토론방입니다.',
      },
      {
        id: 4,
        title: '프로그래밍 스터디',
        participants: 7,
        description: '코딩 지식을 공유하고 문제를 함께 해결하는 채널입니다.',
      },
    ],
    [],
  );

  // 검색 필터링 useMemo로 처리
  const filteredChannels = useMemo(() => {
    if (searchInput.trim() === '') {
      return channels;
    } else {
      return channels.filter(channel =>
        channel.title.toLowerCase().includes(searchInput.toLowerCase()),
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

  // 채널 토글 (시각장애인 모드용)
  const toggleChannelExpand = channelId => {
    setExpandedChannel(expandedChannel === channelId ? null : channelId);
  };

  // 채널 입장 처리
  const handleJoinChannel = channelId => {
    if (isAccessibleMode) {
      previousFocusRef.current = document.activeElement;
    }

    const channel = channels.find(c => c.id === channelId);

    if (channel.isLocked) {
      // 비밀번호가 필요한 채널인 경우
      setCurrentChannelId(channelId);
      setShowPasswordModal(true);

      // 접근성 모드에서 모달에 포커스
      if (isAccessibleMode) {
        setTimeout(() => {
          if (modalRef.current) modalRef.current.focus();
        }, 100);
      }
    } else {
      // 비밀번호가 필요없는 경우
      console.log(`채널 ${channelId} 입장`);
      // 실제 입장 로직 구현 필요
    }
  };

  // 비밀번호 제출 및 방장 수락 대기 처리
  const handlePasswordSubmit = () => {
    // 비밀번호 모달 닫기
    setShowPasswordModal(false);
    setPasswordInput('');

    // 방장 수락 대기 모달 표시
    setShowWaitingModal(true);

    // 서버에 비밀번호 검증 및 방장에게 요청을 보내는 로직 필요
    console.log(`채널 ${currentChannelId} 비밀번호 제출 후 방장 수락 대기`);
  };

  // 대기 취소
  const handleCancelWaiting = () => {
    setShowWaitingModal(false);
    console.log('입장 요청 취소');

    // 접근성 모드
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setShowPasswordModal(false);
    setShowWaitingModal(false);

    // 접근성 모드
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
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

  // 시각장애인 모드 토글 버튼 스타일
  const toggleButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 15px',
    background: isAccessibleMode ? '#FF5722' : '#08976E',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 9999,
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  return (
    <div className="min-h-screen bg-white" style={pageStyle}>
      {/* 시각장애인 모드 토글 버튼 */}
      <button onClick={toggleAccessibleMode} style={toggleButtonStyle}>
        {isAccessibleMode ? '일반 모드로 전환' : '시각장애인 모드로 전환'}
      </button>

      <div className="w-full bg-white py-"></div>
      <div className="w-full bg-transparent py-12">
        <main className="max-w-6xl mx-auto px-6 relative">
          {/* 방 생성 버튼 */}
          <div className="absolute top-0 right-6">
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
              onClick={() => navigate('/voice-channel-room')}
            >
              방 생성
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

          {/* 채널 목록 - 모드에 따라 다른 UI */}
          <section
            aria-label={isAccessibleMode ? '음성 채널 목록' : undefined}
            className="mb-6"
          >
            {isAccessibleMode && (
              <h2 className="sr-only">
                음성 채널 목록 - {filteredChannels.length}개의 채널이 있습니다.
              </h2>
            )}

            {isAccessibleMode ? (
              // 시각장애인 모드용 채널 목록 - 아코디언 스타일
              <div className="space-y-3">
                {filteredChannels.map(channel => (
                  <div
                    key={channel.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                    role="listitem"
                  >
                    {/* 채널 헤더 (항상 표시) */}
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleChannelExpand(channel.id)}
                      tabIndex="0"
                      role="button"
                      aria-expanded={expandedChannel === channel.id}
                      aria-controls={`channel-details-${channel.id}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleChannelExpand(channel.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {/* 채널 상태 아이콘 */}
                        {channel.isLocked ? (
                          <div className="mr-4">
                            <span className="text-yellow-400 text-2xl">🔑</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-blue-500">●</span>
                          </div>
                        )}

                        {/* 채널 제목 */}
                        <h3 className="text-lg font-bold">
                          {channel.title}
                          {channel.isLocked && (
                            <span className="sr-only">
                              {' '}
                              - 비밀번호가 필요한 채널
                            </span>
                          )}
                          {channel.participants && (
                            <span className="sr-only">
                              {' '}
                              - 현재 {channel.participants}명 참여 중
                            </span>
                          )}
                        </h3>
                      </div>

                      {/* 화살표 아이콘 */}
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedChannel === channel.id
                            ? 'transform rotate-180'
                            : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {/* 확장된 채널 정보 */}
                    {expandedChannel === channel.id && (
                      <div
                        id={`channel-details-${channel.id}`}
                        className="p-4 border-t border-gray-200"
                      >
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">채널 설명</h4>
                          <p className="text-gray-700">
                            {channel.description || '설명이 없습니다.'}
                          </p>
                        </div>

                        {channel.participants && (
                          <div className="mb-4">
                            <span className="text-gray-600">
                              현재 참여자: {channel.participants}명
                            </span>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                            onClick={e => {
                              e.stopPropagation();
                              handleJoinChannel(channel.id);
                            }}
                            aria-label={`${channel.title} 채널 입장하기${channel.isLocked ? ', 비밀번호 필요' : ''}`}
                          >
                            {channel.isLocked
                              ? '비밀번호 입력 후 입장'
                              : '입장하기'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredChannels.length === 0 && (
                  <div
                    className="text-center py-10 bg-white rounded-xl shadow-md"
                    role="alert"
                    aria-live="polite"
                  >
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            ) : (
              // 일반 모드용 채널 목록
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredChannels.map(channel => (
                  <div
                    key={channel.id}
                    className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition duration-200 border border-gray-100"
                  >
                    <div className="flex items-center">
                      {channel.isLocked ? (
                        <div className="mr-4">
                          <span className="text-yellow-400 text-2xl">🔑</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-500">●</span>
                        </div>
                      )}
                      <h3 className="text-lg font-bold">{channel.title}</h3>
                    </div>

                    <button
                      className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition duration-200"
                      onClick={() => handleJoinChannel(channel.id)}
                    >
                      입장
                    </button>
                  </div>
                ))}

                {filteredChannels.length === 0 && (
                  <div className="col-span-2 text-center py-10 bg-white rounded-xl shadow-md">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </section>
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
