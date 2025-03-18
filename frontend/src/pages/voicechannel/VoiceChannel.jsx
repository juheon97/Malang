import React, { useState, useMemo, useRef } from 'react';
import PasswordModal from '../../components/modal/PasswordModal';
import WaitingModal from '../../components/modal/WaitingModal';

const VoiceChannel = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);

  // 모달용 포커스 관리 => 접근성 모드에서 사용
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // 시각장애인 모드 토글
  const toggleAccessibleMode = () => {
    setIsAccessibleMode(!isAccessibleMode);
  };

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

    // 접근성 모드에서 포커스 복원
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setShowPasswordModal(false);
    setShowWaitingModal(false);

    // 접근성 모드에서 포커스 복원
    if (isAccessibleMode && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
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
          {/* 방 생성 버튼튼 */}
          <div className="absolute top-0 right-6">
            <button
              className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
              aria-label={
                isAccessibleMode ? '새로운 음성 채널 방 생성하기' : undefined
              }
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

          {/* 검색창창 - 크기 조정 ***/}
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

          {/* 채널 목록 */}
          <section
            aria-label={isAccessibleMode ? '음성 채널 목록' : undefined}
            className="mb-6"
          >
            {isAccessibleMode && (
              <h2 className="sr-only">
                음성 채널 목록 - {filteredChannels.length}개의 채널이 있습니다.
              </h2>
            )}

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              role={isAccessibleMode ? 'list' : undefined}
            >
              {filteredChannels.map(channel => (
                <div
                  key={channel.id}
                  className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition duration-200 border border-gray-100"
                  role={isAccessibleMode ? 'listitem' : undefined}
                >
                  <div className="flex items-center">
                    {channel.isLocked ? (
                      <div
                        className="mr-4"
                        aria-hidden={isAccessibleMode ? 'true' : undefined}
                      >
                        <span className="text-yellow-400 text-2xl">🔑</span>
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4"
                        aria-hidden={isAccessibleMode ? 'true' : undefined}
                      >
                        <span className="text-blue-500">●</span>
                      </div>
                    )}
                    <h3
                      className="text-lg font-bold"
                      tabIndex={isAccessibleMode ? '0' : undefined}
                    >
                      {channel.title}
                      {isAccessibleMode && channel.isLocked && (
                        <span className="sr-only">
                          {' '}
                          - 비밀번호가 필요한 채널
                        </span>
                      )}
                      {isAccessibleMode && channel.participants && (
                        <span className="sr-only">
                          {' '}
                          - 현재 {channel.participants}명 참여 중
                        </span>
                      )}
                    </h3>
                  </div>

                  <button
                    className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition duration-200"
                    onClick={() => handleJoinChannel(channel.id)}
                    aria-label={
                      isAccessibleMode
                        ? `${channel.title} 채널 입장하기${channel.isLocked ? ', 비밀번호 필요' : ''}`
                        : undefined
                    }
                  >
                    입장
                  </button>
                </div>
              ))}

              {filteredChannels.length === 0 && (
                <div
                  className="col-span-2 text-center py-10 bg-white rounded-xl shadow-md"
                  role={isAccessibleMode ? 'alert' : undefined}
                  aria-live={isAccessibleMode ? 'polite' : undefined}
                >
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
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

// import React, { useState, useMemo } from 'react';
// import PasswordModal from '../../components/modal/PasswordModal';
// import WaitingModal from '../../components/modal/WaitingModal';

// const VoiceChannel = () => {
//   const [searchInput, setSearchInput] = useState('');
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [showWaitingModal, setShowWaitingModal] = useState(false);
//   const [passwordInput, setPasswordInput] = useState('');
//   const [currentChannelId, setCurrentChannelId] = useState(null);

//   // 채널 데이터 useMemo로 메모이제이션
//   const channels = useMemo(
//     () => [
//       { id: 1, title: '백종원의 요리교실', participants: 5 },
//       { id: 2, title: '피그마로 수다떨어요', isLocked: true },
//       { id: 3, title: '스탠리', participants: 3 },
//       { id: 4, title: '프로그래밍 스터디', participants: 7 },
//     ],
//     [],
//   );

//   // 검색 필터링 useMemo로 처리
//   const filteredChannels = useMemo(() => {
//     if (searchInput.trim() === '') {
//       return channels;
//     } else {
//       return channels.filter(channel =>
//         channel.title.toLowerCase().includes(searchInput.toLowerCase()),
//       );
//     }
//   }, [searchInput, channels]);

//   const handleSearch = e => {
//     e.preventDefault();
//     console.log('검색어:', searchInput);
//   };

//   // 채널 입장 처리
//   const handleJoinChannel = channelId => {
//     const channel = channels.find(c => c.id === channelId);

//     if (channel.isLocked) {
//       // 비밀번호가 필요한 채널인 경우
//       setCurrentChannelId(channelId);
//       setShowPasswordModal(true);
//     } else {
//       // 비밀번호가 필요없는 경우
//       console.log(`채널 ${channelId} 입장`);
//       //**** */ 실제 입장 로직 구현필요요
//     }
//   };

//   // 비밀번호 제출 및 방장 수락 대기 처리
//   const handlePasswordSubmit = () => {
//     // 비밀번호 모달 닫기
//     setShowPasswordModal(false);
//     setPasswordInput('');

//     // 방장 수락 대기 모달 표시
//     setShowWaitingModal(true);

//     // *******서버에 비밀번호 검증 및 방장에게 요청을 보내는 로직 필요**********
//     console.log(`채널 ${currentChannelId} 비밀번호 제출 후 방장 수락 대기`);
//   };

//   // 대기 취소
//   const handleCancelWaiting = () => {
//     setShowWaitingModal(false);
//     console.log('입장 요청 취소');
//   };

//   // 원형 그라데이션션
//   const pageStyle = {
//     backgroundImage: `
//       radial-gradient(circle at 10% 30%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 15%),
//       radial-gradient(circle at 30% 18%, rgba(233, 230, 47, 0.2) 0%, rgba(255, 255, 255, 0) 15%),
//       radial-gradient(circle at 80% 80%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
//       radial-gradient(circle at 10% 90%, rgba(200, 230, 255, 0.1) 0%, rgba(255, 255, 255, 0) 20%)
//     `,
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//   };

//   return (
//     <div className="min-h-screen bg-white" style={pageStyle}>
//       <div className="w-full bg-white py-"></div>
//       <div className="w-full bg-transparent py-12">
//         <div className="max-w-6xl mx-auto px-6 relative">
//           {/* 방 생성 버튼튼 */}
//           <div className="absolute top-0 right-6">
//             <button className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-6 py-2 rounded-lg shadow-md transition duration-200">
//               방 생성
//             </button>
//           </div>

//           {/* 제목 */}
//           <div className="text-center mb-10">
//             <h1
//               style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
//               className="text-4xl font-bold text-[#00a173]"
//             >
//               음성채널
//             </h1>
//           </div>

//           {/* 검색창창 - 크기 조정 ***/}
//           <div className="mb-12 flex justify-left">
//             <div className="bg-white p-2 rounded-xl shadow-md w-full max-w-md">
//               <div className="relative">
//                 <form onSubmit={handleSearch}>
//                   <input
//                     type="text"
//                     placeholder="방을 검색하세요..."
//                     className="w-full py-2 px-4 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4DC0B5] focus:ring-2 focus:ring-[#4DC0B5] focus:ring-opacity-20 text-sm"
//                     value={searchInput}
//                     onChange={e => setSearchInput(e.target.value)}
//                   />
//                   <button
//                     type="submit"
//                     className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-3 py-1.5 rounded-lg shadow-md transition duration-200 text-xs"
//                   >
//                     검색
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>

//           {/* 채널 목록 */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {filteredChannels.map(channel => (
//               <div
//                 key={channel.id}
//                 className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition duration-200 border border-gray-100"
//               >
//                 <div className="flex items-center">
//                   {channel.isLocked ? (
//                     <div className="mr-4">
//                       <span className="text-yellow-400 text-2xl">🔑</span>
//                     </div>
//                   ) : (
//                     <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
//                       <span className="text-blue-500">●</span>
//                     </div>
//                   )}
//                   <h2 className="text-lg font-bold">{channel.title}</h2>
//                 </div>

//                 <button
//                   className="bg-gradient-to-r from-[#5CCA88] to-[#3FB06C] hover:from-[#6AD3A6] hover:to-[#078263] text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition duration-200"
//                   onClick={() => handleJoinChannel(channel.id)}
//                 >
//                   입장
//                 </button>
//               </div>
//             ))}

//             {filteredChannels.length === 0 && (
//               <div className="col-span-2 text-center py-10 bg-white rounded-xl shadow-md">
//                 <p className="text-gray-500">검색 결과가 없습니다.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* 모달 컴포넌트 */}
//       <PasswordModal
//         isOpen={showPasswordModal}
//         onClose={() => setShowPasswordModal(false)}
//         passwordInput={passwordInput}
//         setPasswordInput={setPasswordInput}
//         onSubmit={handlePasswordSubmit}
//       />

//       <WaitingModal
//         isOpen={showWaitingModal}
//         onCancel={handleCancelWaiting}
//         waitingFor="방장"
//         title="수락을 기다려주세요..."
//       />
//     </div>
//   );
// };

// export default VoiceChannel;
