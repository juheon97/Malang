import React, { useState, useMemo } from 'react';
import PasswordModal from '../../components/modal/PasswordModal';
import WaitingModal from '../../components/modal/WaitingModal';
import { useNavigate } from 'react-router-dom';

const VoiceChannel = () => {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [currentChannelId, setCurrentChannelId] = useState(null);

  // 채널 데이터 useMemo로 메모이제이션
  const channels = useMemo(
    () => [
      { id: 1, title: '백종원의 요리교실', participants: 5 },
      { id: 2, title: '피그마로 수다떨어요', isLocked: true },
      { id: 3, title: '스탠리', participants: 3 },
      { id: 4, title: '프로그래밍 스터디', participants: 7 },
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
  };

  // 채널 입장 처리
  const handleJoinChannel = channelId => {
    const channel = channels.find(c => c.id === channelId);

    if (channel.isLocked) {
      // 비밀번호가 필요한 채널인 경우
      setCurrentChannelId(channelId);
      setShowPasswordModal(true);
    } else {
      // 비밀번호가 필요없는 경우
      console.log(`채널 ${channelId} 입장`);
      //**** */ 실제 입장 로직 구현필요요
    }
  };

  // 비밀번호 제출 및 방장 수락 대기 처리
  const handlePasswordSubmit = () => {
    // 비밀번호 모달 닫기
    setShowPasswordModal(false);
    setPasswordInput('');

    // 방장 수락 대기 모달 표시
    setShowWaitingModal(true);

    // *******서버에 비밀번호 검증 및 방장에게 요청을 보내는 로직 필요**********
    console.log(`채널 ${currentChannelId} 비밀번호 제출 후 방장 수락 대기`);
  };

  // 대기 취소
  const handleCancelWaiting = () => {
    setShowWaitingModal(false);
    console.log('입장 요청 취소');
  };

  // 원형 그라데이션션
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
        <div className="max-w-6xl mx-auto px-6 relative">
          {/* 방 생성 버튼튼 */}
          <div className="absolute top-0 right-6">
          <button
          className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
          onClick={() => navigate('/voice-channel-room')} // 클릭 시 경로 변경
        >
          방 생성
        </button>
    

          </div>

          {/* 제목 */}
          <div className="text-center mb-10">
            <h1
              style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
              className="text-4xl font-bold text-[#00a173]"
            >
              음성채널
            </h1>
          </div>

          {/* 검색창창 - 크기 조정 ***/}
          <div className="mb-12 flex justify-left">
            <div className="bg-white p-2 rounded-xl shadow-md w-full max-w-md">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="방을 검색하세요..."
                    className="w-full py-2 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4DC0B5] focus:ring-2 focus:ring-[#4DC0B5] focus:ring-opacity-20 text-sm"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-3 py-1.5 rounded-lg shadow-md transition duration-200 text-xs"
                  >
                    검색
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 채널 목록 */}
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
                  <h2 className="text-lg font-bold">{channel.title}</h2>
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
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        onSubmit={handlePasswordSubmit}
      />

      <WaitingModal
        isOpen={showWaitingModal}
        onCancel={handleCancelWaiting}
        waitingFor="방장"
        title="수락을 기다려주세요..."
      />
    </div>
  );
};

export default VoiceChannel;
