import React, { useState, useRef, useEffect } from 'react';
import ReviewModal from '../../components/modal/ReviewModal';
import CounselorRequestModal from '../../components/modal/CounselorRequestModal';
import WaitingModal from '../../components/modal/WaitingModal';
import counselorChannel from '../../api/counselorChannel';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';

// 상담사 찾기 페이지
const Counsel = () => {
  const { currentUser } = useAuth();

  const { isAccessibleMode } = useAccessibility();

  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState('review'); // 'review' 또는 'bio'
  const [filters, setFilters] = useState({
    keyword: '',
    specialty: '',
    min_rating: 0,
    page: 1,
    size: 10,
  });

  // 모달 열릴 때 포커스 관리 위함
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // 상담사 목록 조회
  useEffect(() => {
    const fetchCounselors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (import.meta.env.VITE_USE_MOCK_API === 'true') {
          // 모의 API 환경에서는 sessionStorage에서 상담사 목록 가져오기
          const mockCounselors = JSON.parse(
            sessionStorage.getItem('mockCounselors') || '[]',
          );

          // 현재 로그인한 사용자들의 ID 목록
          const activeUserIds = JSON.parse(
            sessionStorage.getItem('loggedInUsers') || '[]',
          );

          // 더미 데이터와 모의 API 데이터 합치기
          const combinedCounselors = [...mockCounselors, ...dummyCounselors];

          // 중복 제거 (ID 기준)
          const uniqueCounselors = combinedCounselors.filter(
            (counselor, index, self) =>
              index === self.findIndex(c => c.id === counselor.id),
          );

          // 로그인 상태에 따라 가능/불가능 상태 설정
          const updatedCounselors = uniqueCounselors.map(counselor => ({
            ...counselor,
            status: activeUserIds.includes(counselor.id) ? '가능' : '불가능',
            isAvailable: activeUserIds.includes(counselor.id),
          }));

          setCounselors(updatedCounselors);
        } else {
          // 실제 API 호출
          const response = await counselorChannel.getChannels(filters);
          if (response && response.data && response.data.counselors) {
            setCounselors(response.data.counselors);
          }
        }
      } catch (err) {
        console.error('상담사 목록 조회 오류:', err);
        setError('상담사 목록을 불러오는 중 오류가 발생했습니다.');
        // 에러 발생 시 더미 데이터 사용
        setCounselors(dummyCounselors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounselors();
  }, [filters, currentUser]);

  // 필터 변경 핸들러
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1, // 필터 변경 시 항상 첫 페이지로
    }));
  };

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

  // 상담 요청 제출 처리
  const handleRequestSubmit = async userInfo => {
    try {
      // 채널 입장 요청 API 호출
      // API 엔드포인트가 명확하지 않음
      // const response = await channelEntry.requestChannelEntry(selectedCounselor.id, userInfo);
      console.log('상담 요청:', userInfo, '상담사:', selectedCounselor?.name);
      setShowRequestModal(false);
      setShowWaitingModal(true); // 대기 모달 표시
    } catch (err) {
      console.error('상담 요청 오류:', err);
      // 오류 처리
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

  // 상담사 더미 데이터 (API 실패 시 대체용)
  const dummyCounselors = [
    {
      id: 1,
      name: '다혜 상담사',
      title: '심리 상담 전문가',
      specialty: '자존감 향상',
      bio: '자존감 향상과 자기 성장에 관심이 있는 분들께 도움을 드립니다.',
      years: 5,
      certifications: ['심리상담사 1급'],
      rating_avg: 4.8,
      review_count: 24,
      status: '가능',
      profile_url: '',
      satisfaction: '98%',
      personalHistory: '5년',
      isAvailable: true,
    },
    {
      id: 2,
      name: '해빈 상담사',
      title: '심리 상담 전문가',
      specialty: '가족 관계, 직장 문제',
      bio: '40년 경력의 노련한 심리 상담사입니다. 가족 관계와 직장 문제에 전문성이 있습니다.',
      years: 40,
      certifications: ['심리상담사 1급', '가족상담사'],
      rating_avg: 4.9,
      review_count: 56,
      status: '가능',
      profile_url: '',
      satisfaction: '98%',
      personalHistory: '40년',
      isAvailable: true,
    },
    {
      id: 3,
      name: '동욱 상담사',
      title: '심리 상담 전문가',
      specialty: '청소년 상담, 학업 스트레스',
      bio: '청소년 상담과 학업 스트레스 관리에 전문성을 가지고 있습니다.',
      years: 5,
      certifications: ['청소년상담사 2급'],
      rating_avg: 4.7,
      review_count: 18,
      status: '가능',
      profile_url: '',
      satisfaction: '97%',
      personalHistory: '5년',
      isAvailable: true,
    },
    {
      id: 4,
      name: '성욱 상담사',
      title: '심리 상담 전문가',
      specialty: '커플 상담, 관계 문제',
      bio: '커플 상담과 관계 문제 해결에 도움을 드릴 수 있습니다.',
      years: 8,
      certifications: ['심리상담사 2급'],
      rating_avg: 4.6,
      review_count: 32,
      status: '가능',
      profile_url: '',
      satisfaction: '95%',
      personalHistory: '8년',
      isAvailable: true,
    },
    {
      id: 5,
      name: '주헌 상담사',
      title: '심리 상담 전문가',
      specialty: '트라우마, PTSD',
      bio: '트라우마와 외상 후 스트레스 장애에 전문적인 도움을 드립니다.',
      years: 12,
      certifications: ['임상심리전문가'],
      rating_avg: 4.9,
      review_count: 45,
      status: '불가능',
      profile_url: '',
      satisfaction: '99%',
      personalHistory: '12년',
      isAvailable: false,
    },
    {
      id: 6,
      name: '경탁 상담사',
      title: '심리 상담 전문가',
      specialty: '자존감, 자기 성장',
      bio: '자존감 향상과 자기 성장에 관심이 있는 분들께 도움을 드립니다.',
      years: 7,
      certifications: ['심리상담사 2급'],
      rating_avg: 4.5,
      review_count: 29,
      status: '불가능',
      profile_url: '',
      satisfaction: '96%',
      personalHistory: '7년',
      isAvailable: false,
    },
    {
      id: 7,
      name: '성원 상담사',
      title: '심리 상담 전문가',
      specialty: '스트레스 관리, 불면증',
      bio: '스트레스 관리와 불면증 극복에 전문적인 도움을 드립니다.',
      years: 4,
      certifications: ['심리상담사 2급'],
      rating_avg: 4.3,
      review_count: 15,
      status: '불가능',
      profile_url: '',
      satisfaction: '94%',
      personalHistory: '4년',
      isAvailable: false,
    },
    {
      id: 8,
      name: '혜다 상담사',
      title: '심리 상담 전문가',
      specialty: '공황장애, 사회불안',
      bio: '공황장애와 사회불안에 전문성을 가지고 있습니다.',
      years: 9,
      certifications: ['임상심리사 1급'],
      rating_avg: 4.7,
      review_count: 38,
      status: '불가능',
      profile_url: '',
      satisfaction: '97%',
      personalHistory: '9년',
      isAvailable: false,
    },
  ];

  // 실제 API 데이터와 더미 데이터 통합
  const displayCounselors =
    counselors.length > 0
      ? counselors.map(c => ({
          ...c,
          isAvailable: c.status === '가능',
          personalHistory: `${c.years}년`,
          satisfaction: `${Math.round((c.rating_avg / 5) * 100)}%`,
          rating: c.rating_avg,
        }))
      : dummyCounselors;

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
              {displayCounselors.filter(c => c.isAvailable).length}명과 현재
              불가능한 상담사{' '}
              {displayCounselors.filter(c => !c.isAvailable).length}명이
              있습니다. 상담사 이름을 클릭하면 상세 정보를 확인할 수 있습니다.
            </div>

            {/* 필터링 섹션 */}
            <section className="mb-6" aria-labelledby="filter-heading">
              <h2 id="filter-heading" className="sr-only">
                상담사 필터링 옵션
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium border border-green-200 hover:bg-green-100"
                  aria-pressed="true"
                  onClick={() => handleFilterChange('status', '')}
                >
                  모든 상담사
                </button>
                <button
                  className="bg-white text-gray-700 px-4 py-2 rounded-full font-medium border border-gray-200 hover:bg-gray-50"
                  aria-pressed="false"
                  onClick={() => handleFilterChange('status', '가능')}
                >
                  현재 가능한 상담사만
                </button>
              </div>
            </section>

            {/* 상담사 목록 */}
            <section aria-labelledby="counselors-heading">
              <h2
                id="counselors-heading"
                className="text-xl font-bold mb-4 text-gray-800"
              >
                상담사 목록 ({displayCounselors.length}명)
              </h2>

              <ul className="space-y-4">
                {displayCounselors.map(counselor => (
                  <li
                    key={counselor.id}
                    className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                      expandedCard === counselor.id ? 'shadow-md' : 'shadow-sm'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer ${
                        counselor.isAvailable ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => toggleCardExpand(counselor.id)}
                      tabIndex="0"
                      role="button"
                      aria-expanded={expandedCard === counselor.id}
                      aria-controls={`counselor-details-${counselor.id}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleCardExpand(counselor.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {/* 상담사 가용성 상태 표시 */}
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            counselor.isAvailable
                              ? 'bg-green-500'
                              : 'bg-gray-400'
                          }`}
                          aria-hidden="true"
                        ></div>

                        {/* 상담사 기본 정보 */}
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {counselor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {counselor.title} | 경력 {counselor.personalHistory}
                          </p>
                        </div>
                      </div>

                      {/* 가용성 텍스트 및 화살표 */}
                      <div className="flex items-center">
                        <span
                          className={`text-sm mr-3 ${
                            counselor.isAvailable
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {counselor.isAvailable ? '상담 가능' : '상담 불가'}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedCard === counselor.id
                              ? 'transform rotate-180'
                              : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* 펼쳐진 상세 정보 */}
                    {expandedCard === counselor.id && (
                      <div
                        id={`counselor-details-${counselor.id}`}
                        className="p-4 border-t"
                      >
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">상담사 소개</h4>
                          <p className="text-gray-700">
                            {counselor.bio || counselor.description}
                          </p>
                        </div>

                        <div className="flex items-center mb-4">
                          <div className="mr-6">
                            <span className="block text-sm text-gray-500">
                              만족도
                            </span>
                            <span className="font-semibold">
                              {counselor.satisfaction}
                            </span>
                          </div>
                          <div>
                            <span className="block text-sm text-gray-500">
                              리뷰
                            </span>
                            <button
                              className="font-semibold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded"
                              onClick={e => {
                                e.stopPropagation();
                                openDetailModal(counselor, 'review');
                              }}
                              aria-label={`${counselor.name}의 리뷰 ${counselor.review_count}개 보기`}
                            >
                              {counselor.review_count}개 보기
                            </button>
                          </div>
                        </div>

                        {/* 상담 요청 버튼 */}
                        <div className="flex justify-end">
                          <button
                            className={`px-6 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              counselor.isAvailable
                                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                                : 'bg-gray-300 cursor-not-allowed text-gray-500'
                            }`}
                            onClick={e => {
                              e.stopPropagation();
                              if (counselor.isAvailable) {
                                openRequestModal(counselor);
                              }
                            }}
                            disabled={!counselor.isAvailable}
                            aria-label={`${counselor.name}에게 상담 요청하기${!counselor.isAvailable ? ' (현재 불가능)' : ''}`}
                          >
                            상담 요청
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
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

          {/* 상담사 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {displayCounselors.map(counselor => (
              <div
                key={counselor.id}
                className="bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-100 hover:-translate-y-1"
                style={{
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* 상담사 프로필 상단 */}
                <div
                  className="relative p-5 text-center"
                  style={{
                    background: `linear-gradient(135deg,rgb(173, 237, 209) 0%,rgb(40, 154, 122) 100%)`,
                    boxShadow: '0 4px 6px -1px rgba(8, 151, 110, 0.2)',
                  }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                  {/* 프로필 이미지 */}
                  <div
                    className="relative mx-auto w-20 h-20 mb-2 rounded-full shadow-lg overflow-hidden"
                    style={{
                      background: counselor.profile_url
                        ? 'transparent'
                        : `#f9d3c0`,
                      boxShadow:
                        '0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(245, 242, 242, 0.5)',
                    }}
                  >
                    {counselor.profile_url ? (
                      <img
                        src={counselor.profile_url}
                        alt={`${counselor.name} 프로필`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 shadow-inner rounded-full"></div>
                    )}
                  </div>

                  <h2
                    style={{
                      fontFamily: "'HancomMalangMalang-Regular', sans-serif",
                    }}
                    className="text-white text-lg font-bold drop-shadow-md"
                  >
                    {counselor.name}
                  </h2>
                  <p className="text-green-50 text-sm mb-2">
                    {counselor.title}
                  </p>

                  <div className="flex justify-center mt-2 space-x-3">
                    <div
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
                      style={{
                        boxShadow:
                          '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
                      }}
                    >
                      <p className="text-white text-sm font-bold">
                        {counselor.satisfaction}
                      </p>
                      <p className="text-green-50 text-xs">만족도</p>
                    </div>
                    <div
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 transform transition hover:scale-105"
                      style={{
                        boxShadow:
                          '0 2px 5px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.3)',
                      }}
                    >
                      <p className="text-white text-sm font-bold">
                        {counselor.personalHistory}
                      </p>
                      <p className="text-green-50 text-xs">상담 경력</p>
                    </div>
                  </div>
                </div>

                {/* 상담사 정보 하단 */}
                <div className="p-4 flex flex-col" style={{ height: '320px' }}>
                  <div className="mb-1">
                    {counselor.isAvailable ? (
                      <div className="flex items-center text-green-500">
                        <svg
                          className="w-5 h-5 mr-1 filter drop-shadow-sm"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span className="text-sm font-medium">
                          상담 자격증 보유
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        상담 자격증 보유
                      </span>
                    )}
                  </div>

                  {/* 상담사 소개 부분 */}
                  <div className="mb-4">
                    <h3 className="font-bold mb-1 text-gray-800">
                      상담사 소개
                    </h3>
                    <p className="text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis mb-1">
                      {counselor.bio ||
                        counselor.description ||
                        '저한테 상담받으세요~'}
                    </p>
                    <button
                      className="text-xs text-green-600 hover:underline mb-0"
                      onClick={e => {
                        e.stopPropagation();
                        openDetailModal(counselor, 'bio');
                      }}
                    >
                      더보기
                    </button>
                  </div>

                  {/* 리뷰 버튼 */}
                  <div
                    className="flex items-center mb-4 cursor-pointer group"
                    onClick={() => openDetailModal(counselor, 'review')}
                  >
                    <span className="text-sm font-medium mr-2 group-hover:text-green-500 transition-colors">
                      리뷰 {counselor.review_count || '20'}+
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(counselor.rating || 5)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          } filter drop-shadow-sm`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    {/* 리뷰 더보기 */}
                    <svg
                      className="w-4 h-4 ml-1 text-gray-400 group-hover:text-green-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </div>

                  {/* 문구 박스 */}
                  <div
                    className="p-3 rounded-lg mb-3 relative overflow-hidden flex-grow"
                    style={{
                      background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                      minHeight: '50px', // 최소 높이 보장
                    }}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gray-200 opacity-30 rounded-full -mr-8 -mt-8"></div>
                    <p className="text-sm text-gray-600 relative z-10">
                      어떤 상담 받으시나요? 궁금...
                    </p>
                  </div>

                  {/* 상담 요청 버튼 */}
                  <button
                    className="w-1/2 mx-auto block text-white py-2 rounded-full font-medium transition duration-200 transform hover:scale-105 mt-auto"
                    style={{
                      background: counselor.isAvailable
                        ? 'linear-gradient(to right,rgb(125, 233, 188),rgb(64, 193, 126))'
                        : 'linear-gradient(to right, #9CA3AF, #6B7280)',
                      boxShadow: counselor.isAvailable
                        ? '0 4px 6px -1px rgba(8, 151, 110, 0.3), 0 2px 4px -1px rgba(8, 151, 110, 0.1)'
                        : '0 4px 6px -1px rgba(107, 114, 128, 0.3), 0 2px 4px -1px rgba(107, 114, 128, 0.1)',
                    }}
                    onClick={() => openRequestModal(counselor)}
                    disabled={!counselor.isAvailable}
                  >
                    상담 요청
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          />
        </div>
      )}
    </div>
  );
};

export default Counsel;
