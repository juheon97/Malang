import React, { useState, useRef, useEffect } from 'react';
import ReviewModal from '../../components/modal/ReviewModal';
import CounselorRequestModal from '../../components/modal/CounselorRequestModal';
import WaitingModal from '../../components/modal/WaitingModal';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import counselWebSocketService from '../../services/counselwebsocketService';

// 커스텀 훅과 컴포넌트 임포트
import useCounselors from './hooks/useCounselors';
import CounselorList from './components/CounselorList';
import CounselorFilter from './components/CounselorFilter';

/**
 * 상담사 찾기 페이지
 */
const Counsel = () => {
  const { currentUser } = useAuth();
  const { isAccessibleMode } = useAccessibility();

  // 상담사 커스텀 훅 사용
  const {
    counselors,
    isLoading,
    error,
    handleFilterChange,
    refreshCounselors,
  } = useCounselors();

  // 상태 관리
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [contentType, setContentType] = useState('review'); // 'review' 또는 'bio'
  const [userRequestInfo, setUserRequestInfo] = useState(null); // 상담 요청 정보 저장

  // 모달 열릴 때 포커스 관리 위함
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // 컴포넌트 마운트 시 프로필 업데이트 여부 확인 및 강제 새로고침
  useEffect(() => {
    const profileUpdated = sessionStorage.getItem('profile_updated') === 'true';
    if (profileUpdated) {
      // 플래그 제거
      sessionStorage.removeItem('profile_updated');
      console.log('프로필 업데이트가 감지되어 상담사 목록을 새로고침합니다.');
      // 페이지 강제 새로고침
      window.location.reload();
    }
  }, []);

  // 소개 전문 모달 열기 (기존 리뷰 모달 기능 확장)
  const openDetailModal = (counselor, modalContentType = 'review') => {
    previousFocusRef.current = document.activeElement;
    setSelectedCounselor(counselor);
    setContentType(modalContentType); // 'review' 또는 'bio'
    setShowReviewModal(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (modalRef.current) modalRef.current.focus();
    }, 100);
  };

  // 상담 요청 모달 열기
  const openRequestModal = counselor => {
    previousFocusRef.current = document.activeElement;
    setSelectedCounselor(counselor);
    setShowRequestModal(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (modalRef.current) modalRef.current.focus();
    }, 100);
  };

  const handleRequestSubmit = async userInfo => {
    try {
      console.log('상담 요청:', userInfo, '상담사:', selectedCounselor?.name);
      // 사용자 요청 정보 저장
      setUserRequestInfo(userInfo);

      // userInfo에서 counselor_code를 문자열로 변환하여 사용
      const counselorCode = String(userInfo.counselor_code);
      if (counselorCode) {
        console.log(`웹소켓 연결 시도: 상담사 코드 ${counselorCode}`);

        // 연결 후 /sub/{counselorCode}/access 주소로 구독이 자동 등록됨
        const handleAccessCallback = message => {
          console.log('[웹소켓] 입장 요청 메시지 수신:', message);
        };

        counselWebSocketService.connect(counselorCode, handleAccessCallback);

        // 연결 후 1초 정도 기다린 후 구독 상태를 확인하고, 성공하면 pub 주소로 join_con 메시지를 전송
        setTimeout(() => {
          const subscriptions = Array.from(
            counselWebSocketService.subscriptions.keys(),
          );
          if (subscriptions.includes(`access-${counselorCode}`)) {
            console.log(`[웹소켓] /sub/${counselorCode}/access 구독 성공!`);
            // join_con 메시지 전송 (pub 주소로)
            const publishSuccess = counselWebSocketService.sendJoinRequest(
              counselorCode,
              userInfo,
            );
            if (publishSuccess) {
              console.log(
                `[웹소켓] /pub/${counselorCode}/access로 join_con 메시지 전송 성공`,
              );
            } else {
              console.warn(
                `[웹소켓] /pub/${counselorCode}/access로 join_con 메시지 전송 실패`,
              );
            }
          } else {
            console.warn(`[웹소켓] /sub/${counselorCode}/access 구독 실패`);
          }
        }, 1000);
      } else {
        console.warn(
          '상담사 코드가 없습니다. 웹소켓 연결을 시도할 수 없습니다.',
        );
      }

      // 요청 모달 닫고 대기 모달 표시
      setShowRequestModal(false);
      setShowWaitingModal(true);
    } catch (err) {
      console.error('상담 요청 오류:', err);
    }
  };

  // 대기 취소
  const handleCancelWaiting = () => {
    setShowWaitingModal(false);
    document.body.style.overflow = 'unset';
    console.log('상담 요청 취소');
    if (previousFocusRef.current) previousFocusRef.current.focus();
  };

  // 모달 닫기
  const closeModal = () => {
    setShowReviewModal(false);
    setShowRequestModal(false);
    setShowWaitingModal(false);
    document.body.style.overflow = 'unset';
    if (previousFocusRef.current) previousFocusRef.current.focus();
  };

  // 카드 확장/축소
  const toggleCardExpand = counselorId => {
    if (expandedCard === counselorId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(counselorId);
    }
  };

  // 배경 스타일 (일반 모드에서 사용)
  const pageStyle = {
    backgroundImage: `
      radial-gradient(circle at 5% -2%, rgba(121, 231, 183, 0.2) 0%, rgba(255, 255, 255, 0) 4%),
      radial-gradient(circle at 0% 4%, rgba(233, 230, 47, 0.16) 0%, rgba(255, 255, 255, 0) 5%),
      radial-gradient(circle at 80% 3%, rgba(8, 151, 110, 0.1) 0%, rgba(255, 255, 255, 0) 25%),
      radial-gradient(circle at 6% 95%, rgba(249, 200, 255, 0.52) 0%, rgba(255, 255, 255, 0) 20%)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-4xl mx-auto mb-4">
          {error}
        </div>
      )}

      {isAccessibleMode ? (
        // 시각장애인 모드 UI
        <main className="p-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
            {/* 페이지 제목 */}
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800" tabIndex="0">
                상담사 찾기
              </h1>
              <p className="mt-2 text-gray-600">
                필요한 분야의 전문 상담사를 찾아보세요
              </p>
            </header>

            {/* 스크린 리더 사용자를 위한 페이지 설명 */}
            <div className="sr-only" tabIndex="0">
              이 페이지에서는 다양한 심리 상담 전문가를 찾고 상담을 요청할 수
              있습니다. 가능한 상담사{' '}
              {counselors.filter(c => c.isAvailable).length}명과 현재 불가능한
              상담사 {counselors.filter(c => !c.isAvailable).length}명이
              있습니다. 상담사 이름을 클릭하면 상세 정보를 확인할 수 있습니다.
            </div>

            {/* 필터링 섹션 */}
            <CounselorFilter
              handleFilterChange={handleFilterChange}
              isAccessibleMode={isAccessibleMode}
            />

            {/* 상담사 목록 */}
            <CounselorList
              counselors={counselors}
              isAccessibleMode={isAccessibleMode}
              expandedCard={expandedCard}
              toggleCardExpand={toggleCardExpand}
              onReviewClick={counselor => openDetailModal(counselor, 'review')}
              onRequestClick={openRequestModal}
            />
          </div>
        </main>
      ) : (
        // 일반 모드 UI (원래의 디자인)
        <div
          className="max-w-7xl mx-auto p-6 mt-6 bg-white rounded-3xl shadow-2xl relative overflow-hidden"
          style={pageStyle}
        >
          {/* 시각적 장식 요소 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-50 rounded-full -ml-48 -mb-48 opacity-20"></div>

          {/* 제목 */}
          <div className="flex items-center mb-6 relative z-10">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 mr-3 rounded-full shadow-md"></div>
            <h1
              style={{ fontFamily: "'HancomMalangMalang-Regular', sans-serif" }}
              className="text-2xl font-bold text-gray-800 relative"
            >
              상담사 찾기
            </h1>
          </div>

          {/* 필터링 섹션 */}
          <CounselorFilter
            handleFilterChange={handleFilterChange}
            isAccessibleMode={isAccessibleMode}
          />

          {/* 상담사 목록 */}
          <CounselorList
            counselors={counselors}
            isAccessibleMode={isAccessibleMode}
            onReviewClick={counselor => openDetailModal(counselor, 'review')}
            onBioClick={counselor => openDetailModal(counselor, 'bio')}
            onRequestClick={openRequestModal}
          />
        </div>
      )}

      {/* 모달 컴포넌트들 - 두 모드 모두에서 사용 */}
      {/* 리뷰 모달 */}
      {showReviewModal && selectedCounselor && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          tabIndex="-1"
          className="fixed inset-0 z-50"
        >
          <ReviewModal
            counselor={selectedCounselor}
            onClose={closeModal}
            contentType={contentType}
          />
        </div>
      )}

      {/* 상담 요청 모달 */}
      {showRequestModal && selectedCounselor && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-modal-title"
          tabIndex="-1"
          className="fixed inset-0 z-50"
        >
          <CounselorRequestModal
            isOpen={showRequestModal}
            onClose={closeModal}
            onSubmit={handleRequestSubmit}
            counselor={selectedCounselor}
          />
        </div>
      )}

      {/* 상담사 대기 모달 */}
      {showWaitingModal && selectedCounselor && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-live="assertive"
          aria-labelledby="waiting-modal-title"
          tabIndex="-1"
          className="fixed inset-0 z-50"
        >
          <WaitingModal
            isOpen={showWaitingModal}
            onCancel={handleCancelWaiting}
            waitingFor="상담사"
            title="수락을 기다려주세요..."
            message="상담사가 요청을 확인하고 있습니다. 잠시만 기다려주세요."
            userInfo={userRequestInfo} // 사용자 정보 전달
            counselor={selectedCounselor} // 상담사 정보 전달
          />
        </div>
      )}
    </div>
  );
};

export default Counsel;
