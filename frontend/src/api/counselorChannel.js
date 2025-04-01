import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
// 환경에 따른 API 기본 URL 설정
const isDevelopment = import.meta.env
  ? import.meta.env.MODE === 'development'
  : process.env.NODE_ENV === 'development';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 설정
});

// 요청 인터셉터 설정 - 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const token =
      sessionStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// 응답 인터셉터 설정 - 에러 처리
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 401 에러 (인증 실패) 처리
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 로직
        const refreshToken =
          sessionStorage.getItem('refreshToken') ||
          localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // 리프레시 토큰이 없으면 로그아웃 처리
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('refreshToken');

          // 로그아웃 이벤트 발생
          const logoutEvent = new CustomEvent('auth:logout');
          window.dispatchEvent(logoutEvent);

          return Promise.reject(error);
        }

        // 토큰 갱신 요청
        const response = await axios.post(
          `${BASE_URL}/auth/token/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        // 새 토큰 저장
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        sessionStorage.setItem('token', accessToken);

        if (newRefreshToken) {
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }

        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');

        // 로그아웃 이벤트 발생
        const logoutEvent = new CustomEvent('auth:logout');
        window.dispatchEvent(logoutEvent);

        return Promise.reject(refreshError);
      }
    }

    // API 에러 응답 포맷팅
    if (error.response && error.response.data) {
      return Promise.reject({
        status: error.response.status,
        ...error.response.data,
        message:
          error.response.data.message ||
          error.response.data.error ||
          '요청 처리 중 오류가 발생했습니다.',
      });
    }

    // 네트워크 오류
    if (error.message === 'Network Error') {
      return Promise.reject({
        message: '서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.',
      });
    }

    // 타임아웃 오류
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.',
      });
    }

    return Promise.reject(error);
  },
);

/**
 * ID를 정수로 변환하는 헬퍼 함수
 */
const ensureIntId = id => {
  if (id === undefined || id === null) return null;
  if (typeof id === 'number') return id;

  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * 상담방 관련 API
 */
const counselorChannel = {
  /**
   * 상담방 생성 (상담사)
   * @param {Object} channelData - 상담방 생성 데이터
   * @param {string} channelData.channelName - 상담방 이름
   * @param {string} channelData.description - 상담방 설명
   * @param {number} channelData.maxPlayer - 최대 참여 인원
   * @returns {Promise<Object>} 생성된 상담방 정보
   */
  createChannel: async channelData => {
    try {
      console.log('상담방 생성 요청 데이터:', channelData);

      // 사용자 정보와 상관없이 무조건 ID 1 사용
      const counselorId = 1;

      console.log('상담방 생성 사용할 상담사 ID:', counselorId);

      // API 요청 - PUT 메서드로 변경
      const response = await apiClient.put(
        `/api/counselor/profile/${counselorId}`,
        channelData,
      );

      console.log('상담방 생성 원본 응답:', response.data);

      // 응답에서 counselor_code 가져오기
      let counselorCode = null;
      if (response.data && response.data.counselor_code) {
        counselorCode = response.data.counselor_code;
      } else if (response.data && response.data.counselorCode) {
        counselorCode = response.data.counselorCode;
      } else {
        // 기본값 10001 사용 (테스트용)
        counselorCode = 10001;
        console.warn('응답에서 counselor_code를 찾을 수 없어 기본값 사용');
      }

      // 응답 데이터에 counselorCode 추가
      const responseData = {
        ...response.data,
        counselorCode: counselorCode,
        channelId: String(counselorCode), // 채널 ID로도 사용
      };

      console.log('상담방 생성 가공된 응답:', responseData);
      return responseData;
    } catch (error) {
      console.error('상담방 생성 오류:', error);
      throw error;
    }
  },

  /**
   * 상담사 목록/상담방 찾기
   * @param {Object} params - 필터링 및 페이징 파라미터
   * @param {string} [params.keyword] - 검색어 (상담사 이름 또는 설명)
   * @param {string} [params.specialty] - 상담사 전문 분야
   * @param {number} [params.min_rating] - 최소 평점
   * @param {number} [params.page=1] - 페이지 번호
   * @param {number} [params.size=10] - 페이지당 항목 수
   * @returns {Promise<Object>} 상담사 목록 및 페이징 정보
   */
  getChannels: async (params = {}) => {
    try {
      // 타임스탬프 추가 (캐시 방지)
      const timestamp = new Date().getTime();

      // API 요청 설정
      const config = {
        params: { ...params, _t: timestamp },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      };

      const response = await apiClient.get(
        '/channels/counseling/counselors',
        config,
      );

      // ID를 정수로 변환
      if (response.data && response.data.content) {
        response.data.content = response.data.content.map(counselor => ({
          ...counselor,
          id: ensureIntId(counselor.id),
          // status를 숫자로 변환 (문자열 '가능'/'불가능' 대신 1/0 사용)
          status:
            counselor.status === '가능' ? 1 : counselor.status === 1 ? 1 : 0,
        }));
      }

      return response.data;
    } catch (error) {
      console.error('상담방/상담사 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 상담사 리뷰 조회
   * @param {string|number} counselorId 상담사 ID
   * @param {Object} params - 페이징 및 정렬 파라미터
   * @param {number} [params.page=1] - 페이지 번호
   * @param {number} [params.size=10] - 페이지당 항목 수
   * @param {string} [params.sort='createdAt,desc'] - 정렬 기준
   * @returns {Promise<Object>} 리뷰 목록 및 페이징 정보
   */
  getCounselorReviews: async (counselorId, params = {}) => {
    try {
      // ID를 정수로 변환
      const intCounselorId = ensureIntId(counselorId);

      // 타임스탬프 추가 (캐시 방지)
      const timestamp = new Date().getTime();

      // 정렬 파라미터 변환
      let sortParam = params.sort || 'createdAt,desc'; // 기본값 설정

      // 'latest', 'rating_high', 'rating_low' 같은 문자열 변환
      if (sortParam === 'latest') {
        sortParam = 'createdAt,desc';
      } else if (sortParam === 'rating_high') {
        sortParam = 'score,desc';
      } else if (sortParam === 'rating_low') {
        sortParam = 'score,asc';
      }

      const updatedParams = {
        ...params,
        sort: sortParam,
        _t: timestamp,
      };

      const response = await apiClient.get(
        `/channels/counseling/counselors/${intCounselorId}/reviews`,
        {
          params: updatedParams,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      );

      // 리뷰 ID를 정수로 변환
      if (response.data && response.data.content) {
        response.data.content = response.data.content.map(review => ({
          ...review,
          review_id: ensureIntId(review.review_id),
        }));
      }

      return response.data;
    } catch (error) {
      console.error('상담사 리뷰 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 입장 요청 수락/거절 (상담사)
   * @param {string|number} channelId - 채널 ID
   * @param {string|number} requestId - 요청 ID
   * @param {string} status - 처리 상태 ('accept' 또는 'reject')
   * @returns {Promise<Object>} 처리 결과
   */
  approveChannelRequest: async (channelId, requestId, status) => {
    try {
      // counselor_code 사용
      console.log(
        `입장 요청 처리: counselor_code=${channelId}, requestId=${requestId}, status=${status}`,
      );

      const response = await apiClient.post(
        `/channels/counseling/counselor/${channelId}/approve`,
        {
          status: status,
        },
        {
          params: { request_id: requestId },
        },
      );
      return response.data;
    } catch (error) {
      console.error('입장 요청 처리 오류:', error);
      throw error;
    }
  },

  /**
   * 상담방 입장 (연결)
   * @param {string|number} channelId - 채널 ID
   * @returns {Promise<Object>} 입장 결과 및 방 정보
   */
  connectToChannel: async channelId => {
    try {
      console.log(`상담방 입장 요청: counselor_code=${channelId}`);

      const response = await apiClient.post(
        `/channels/counseling/counselor/${channelId}/connect`,
      );
      return response.data;
    } catch (error) {
      console.error('상담방 입장 오류:', error);
      throw error;
    }
  },

  /**
   * 상담 세션 종료 후 리뷰 작성
   * @param {string|number} sessionId - 상담 세션 ID
   * @param {Object} reviewData - 리뷰 데이터
   * @param {number} reviewData.score - 평점 (1-5)
   * @param {string} reviewData.content - 리뷰 내용
   * @returns {Promise<Object>} 리뷰 작성 결과
   */
  submitCounselingReview: async (sessionId, reviewData) => {
    try {
      // ID를 정수로 변환
      const intSessionId = ensureIntId(sessionId);

      const response = await apiClient.post(
        `/channels/counseling/review`,
        reviewData,
        {
          params: { session_id: intSessionId },
        },
      );
      return response.data;
    } catch (error) {
      console.error('상담 리뷰 작성 오류:', error);
      throw error;
    }
  },

  /**
   * 상담방 입장 요청 (사용자)
   * @param {string|number} channelId - 채널 ID
   * @param {Object} userData - 사용자 정보 (이름, 생년월일 등)
   * @returns {Promise<Object>} 요청 결과
   */
  requestChannelEntry: async (channelId, userData) => {
    try {
      console.log(
        `상담방 입장 요청: counselor_code=${channelId}, userData=`,
        userData,
      );

      // counselor_code 사용
      const updatedUserData = {
        ...userData,
        counselorCode: channelId,
      };

      const response = await apiClient.post(
        `/channels/counseling/counselor/request`,
        updatedUserData,
      );
      return response.data;
    } catch (error) {
      console.error('상담방 입장 요청 오류:', error);
      throw error;
    }
  },

  /**
   * 입장 요청 목록 조회 (상담사용)
   * @param {string|number} channelId - 상담방 ID
   * @returns {Promise<Object>} 입장 요청 목록
   */
  getEntryRequests: async channelId => {
    try {
      console.log(`입장 요청 목록 조회: counselor_code=${channelId}`);

      const response = await apiClient.get(
        `/channels/counseling/counselor/${channelId}/requests`,
      );

      return response.data;
    } catch (error) {
      console.error('입장 요청 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 상담사 상세 정보 조회
   * @param {string|number} counselorId - 상담사 ID
   * @returns {Promise<Object>} 상담사 상세 정보
   */
  getCounselorDetails: async counselorId => {
    try {
      // ID를 정수로 변환
      const intCounselorId = ensureIntId(counselorId);

      // 타임스탬프 추가 (캐시 방지)
      const timestamp = new Date().getTime();

      const response = await apiClient.get(
        `/channels/counseling/counselors/${intCounselorId}`,
        {
          params: { _t: timestamp },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      );

      // ID를 정수로 변환
      if (response.data) {
        response.data.id = ensureIntId(response.data.id);
        // status가 문자열인 경우 숫자로 변환
        if (typeof response.data.status === 'string') {
          response.data.status = response.data.status === '가능' ? 1 : 0;
        }
      }

      return response.data;
    } catch (error) {
      console.error('상담사 상세 정보 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 상담 세션 종료
   * @param {string|number} channelId - 채널 ID
   * @returns {Promise<Object>} 종료 결과
   */
  endCounselingSession: async channelId => {
    try {
      console.log(`상담 세션 종료 요청: counselor_code=${channelId}`);

      // counselor_code 사용
      const response = await apiClient.post(
        `/channels/counseling/counselor/${channelId}/end`,
      );

      // 상담사의 상태를 '불가능'(0)으로 변경
      await counselorChannel.updateCounselorStatus(false);

      return response.data;
    } catch (error) {
      console.error('상담 세션 종료 오류:', error);
      throw error;
    }
  },

  /**
   * 상담방 나가기 (상담사용)
   * @param {string|number} channelId - 채널 ID
   * @returns {Promise<Object>} 처리 결과
   */
  leaveCounselorChannel: async channelId => {
    try {
      console.log(`상담사 방 나가기: counselor_code=${channelId}`);

      // 상담사가 방을 나가면 방 종료 API 호출
      try {
        // counselor_code로 API 호출
        const response = await apiClient.post(
          `/channels/counseling/counselor/${channelId}/end`,
        );
        console.log('방 종료 API 응답:', response.data);
      } catch (error) {
        console.error('방 종료 API 호출 실패:', error);
        // 실패해도 계속 진행
      }

      // 상담사 상태를 '불가능'(0)으로 변경
      await counselorChannel.updateCounselorStatus(false);

      // 성공 응답 반환
      return { success: true, message: '상담방 종료 완료' };
    } catch (error) {
      console.error('상담방 나가기 오류:', error);
      throw error;
    }
  },

  /**
   * 상담방 나가기 (사용자용)
   * @param {string|number} channelId - 채널 ID
   * @returns {Promise<Object>} 처리 결과
   */
  leaveChannel: async channelId => {
    try {
      console.log(`내담자 방 나가기: counselor_code=${channelId}`);

      try {
        // counselor_code로 API 호출
        const response = await apiClient.post(
          `/channels/counseling/counselor/${channelId}/leave`,
        );
        console.log('방 나가기 API 응답:', response.data);
        return response.data;
      } catch (error) {
        console.error('방 나가기 API 호출 실패:', error);
        // 실패해도 성공 응답 반환
        return { success: true, message: '상담방 나가기 완료' };
      }
    } catch (error) {
      console.error('상담방 나가기 오류:', error);
      throw error;
    }
  },

  /**
   * 상담사 상태 업데이트 (가능/불가능)
   * @param {boolean} isAvailable - 상담 가능 여부 (true: 가능, false: 불가능)
   * @returns {Promise<Object>} 업데이트 결과
   */
  updateCounselorStatus: async isAvailable => {
    try {
      // 상담사 ID 1 고정
      const counselorId = 1;

      // 상태값 변환 (true면 '가능'(1), false면 '불가능'(0))
      const statusValue = isAvailable ? 1 : 0;

      console.log(
        `상담사(${counselorId}) 상태 업데이트: ${isAvailable ? '가능' : '불가능'}`,
      );

      // API 기본 URL 중복 /api 문제 해결
      const API_BASE = import.meta.env.VITE_API_URL;
      const FIXED_URL = API_BASE.endsWith('/api')
        ? API_BASE.slice(0, -4) // '/api' 제거
        : API_BASE;

      // API 요청 - PUT 메서드로 상담사 프로필 상태 업데이트
      const response = await apiClient.put(
        `${FIXED_URL}/api/counselor/profile/${counselorId}`,
        { status: statusValue },
      );

      // 상태 변경 이벤트 발생 (UI 업데이트용)
      const statusChangeEvent = new CustomEvent('counselor:statusChange', {
        detail: {
          isAvailable,
          counselorId: counselorId,
        },
      });
      window.dispatchEvent(statusChangeEvent);

      return response.data;
    } catch (error) {
      console.error('상담사 상태 업데이트 오류:', error);
      throw error;
    }
  },

  /**
   * 상담사 상태 업데이트 (가능/불가능)
   * @param {boolean} isAvailable - 상담 가능 여부 (true: 가능, false: 불가능)
   * @returns {Promise<Object>} 업데이트 결과
   */
  updateCounselorStatus: async isAvailable => {
    try {
      // 상담사 ID 1 고정
      const counselorId = 1;

      // 상태값 변환 (true면 '가능'(1), false면 '불가능'(0))
      const statusValue = isAvailable ? 1 : 0;

      console.log(
        `상담사(${counselorId}) 상태 업데이트: ${isAvailable ? '가능' : '불가능'}`,
      );

      // API 요청 - PUT 메서드로 상담사 프로필 상태 업데이트
      const response = await apiClient.put(
        `/api/counselor/profile/${counselorId}`,
        { status: statusValue },
      );

      // 상태 변경 이벤트 발생 (UI 업데이트용)
      const statusChangeEvent = new CustomEvent('counselor:statusChange', {
        detail: {
          isAvailable,
          counselorId: counselorId,
        },
      });
      window.dispatchEvent(statusChangeEvent);

      return response.data;
    } catch (error) {
      console.error('상담사 상태 업데이트 오류:', error);
      throw error;
    }
  },

  /**
   * 채널 상태 확인 (채널이 존재하는지, 상담사가 상담 가능한지)
   * @param {string|number} counselorId - 상담사 ID
   * @returns {Promise<Object>} 채널 상태 정보
   */
  checkChannelStatus: async counselorId => {
    try {
      // ID를 정수로 변환
      const intCounselorId = ensureIntId(counselorId);

      console.log('채널 상태 확인 요청 ID:', intCounselorId);

      const timestamp = new Date().getTime();
      const response = await apiClient.get(
        `/channels/counseling/counselors/${intCounselorId}`,
        {
          params: { _t: timestamp },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      );

      console.log('채널 상태 확인 응답 원본:', response.data);

      // ID를 정수로 변환
      if (response.data) {
        response.data.id = ensureIntId(response.data.id);

        // status가 문자열인 경우 숫자로 변환
        if (typeof response.data.status === 'string') {
          response.data.status = response.data.status === '가능' ? 0 : 1;
        }

        console.log('처리 후 상담사 상태:', response.data.status);
      }

      // 응답에서 status 값 확인 (0이면 상담 가능)
      const isAvailable = response.data && response.data.status === 0;
      console.log('최종 isAvailable 값:', isAvailable);

      return {
        isAvailable: isAvailable,
        channelExists: response.data && (response.data.hasChannel || false),
        counselor: response.data,
      };
    } catch (error) {
      console.error('채널 상태 확인 오류:', error);
      // 기본값 반환
      return {
        isAvailable: false,
        channelExists: false,
        counselor: null,
      };
    }
  },

  /**
   * 상담사의 채널 ID 가져오기
   * @param {string|number} counselorId - 상담사 ID
   * @returns {Promise<Object>} 채널 ID 정보
   */
  getCounselorChannelId: async counselorId => {
    try {
      // ID를 정수로 변환
      const intCounselorId = ensureIntId(counselorId);

      console.log('상담사 채널 ID 조회 요청:', intCounselorId);

      const response = await apiClient.get(
        `/channels/counseling/counselors/${intCounselorId}/channel`,
      );

      console.log('상담사 채널 ID 조회 응답:', response.data);

      // 응답에 counselorCode 추가
      if (
        response.data &&
        !response.data.counselorCode &&
        response.data.counselor_code
      ) {
        response.data.counselorCode = response.data.counselor_code;
      }

      // 응답이 있지만 counselorCode가 없는 경우, 기본값 사용
      if (response.data && !response.data.counselorCode) {
        console.warn('응답에서 counselor_code를 찾을 수 없어 기본값 사용');
        response.data.counselorCode = 10001;
      }

      return response.data;
    } catch (error) {
      console.error('상담사 채널 ID 조회 오류:', error);

      // 에러 발생 시 기본 응답 반환
      return {
        counselorCode: 10001,
        channelId: '10001',
        error: true,
        message: '채널 정보를 가져오는데 실패했습니다',
      };
    }
  },

  /**
   * 모의 API 데이터 생성 (개발용)
   */
  mockData: {
    // 모의 상담사 목록 생성
    generateMockCounselors: (count = 8) => {
      const counselors = [];
      for (let i = 1; i <= count; i++) {
        counselors.push({
          id: i, // 이미 정수형
          name: `상담사 ${i}`,
          title: '심리 상담 전문가',
          specialty: ['자존감 향상', '가족 관계', '직장 문제', '학업 스트레스'][
            i % 4
          ],
          bio: '전문적인 심리 상담을 제공합니다.',
          years: Math.floor(Math.random() * 15) + 3,
          certifications: ['심리상담사 1급', '가족상담사 2급'],
          rating_avg: (Math.random() * 1.5 + 3.5).toFixed(1),
          review_count: Math.floor(Math.random() * 50) + 5,
          // 상태를 문자열에서 정수로 변경 (1: 가능, 0: 불가능)
          status: Math.random() > 0.5 ? 1 : 0,
          profile_url: '',
          isAvailable: Math.random() > 0.5,
          counselor_code: 10000 + i, // 상담사 코드 추가
        });
      }
      return counselors;
    },

    // 모의 리뷰 생성
    generateMockReviews: (count = 10) => {
      const reviews = [];
      for (let i = 1; i <= count; i++) {
        reviews.push({
          // 문자열 대신 정수형 ID 사용
          review_id: i,
          user_nickname: `사용자${i}`,
          content: '상담이 매우 도움이 되었습니다. 감사합니다.',
          score: Math.floor(Math.random() * 2) + 4,
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
        });
      }
      return reviews;
    },
  },
};

export default counselorChannel;
