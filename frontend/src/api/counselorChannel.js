import axios from 'axios';

// 환경에 따른 API 기본 URL 설정
const isDevelopment = import.meta.env
  ? import.meta.env.MODE === 'development'
  : process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment
  ? 'http://localhost:8080/api'
  : 'https://J12D110.p.ssafy.io/api';

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
 * 상담방 관련 API
 */
const counselorChannel = {
  /**
   * 상담방 생성 (상담사)
   * @param {Object} channelData - 상담방 생성 데이터
   * @param {string} channelData.channel_name - 상담방 이름
   * @param {string} channelData.channel_text - 상담방 설명
   * @param {number} channelData.max_player - 최대 참여 인원
   * @returns {Promise<Object>} 생성된 상담방 정보
   */
  createChannel: async channelData => {
    try {
      const response = await apiClient.post('/counselor-channels', channelData);
      return response.data;
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
      const response = await apiClient.get('/counselor-channels', { params });
      return response.data;
    } catch (error) {
      console.error('상담방/상담사 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 상담사 리뷰 조회
   * @param {string|number} counselorId - 상담사 ID
   * @param {Object} params - 페이징 및 정렬 파라미터
   * @param {number} [params.page=1] - 페이지 번호
   * @param {number} [params.size=10] - 페이지당 항목 수
   * @param {string} [params.sort='latest'] - 정렬 기준 (최신순: 'latest', 평점 높은순: 'rating_high', 평점 낮은순: 'rating_low')
   * @returns {Promise<Object>} 리뷰 목록 및 페이징 정보
   */
  getCounselorReviews: async (counselorId, params = {}) => {
    try {
      const response = await apiClient.get(
        `/counselors/${counselorId}/reviews`,
        { params },
      );
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
      // API 명세서에 따라 수정
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/approve`,
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
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/connect`,
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
      // API 명세서에 따라 경로 수정
      const response = await apiClient.post(`/counseling-review`, reviewData, {
        params: { session_id: sessionId },
      });
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
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/request`,
        userData,
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
      const response = await apiClient.get(
        `/counselor-channels/${channelId}/requests`,
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
      const response = await apiClient.get(`/counselors/${counselorId}`);
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
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/end`,
      );
      return response.data;
    } catch (error) {
      console.error('상담 세션 종료 오류:', error);
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
      const response = await apiClient.post(
        `/counselor-channels/${channelId}/leave`,
      );
      return response.data;
    } catch (error) {
      console.error('상담방 나가기 오류:', error);
      throw error;
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
          id: i,
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
          status: Math.random() > 0.5 ? '가능' : '불가능',
          profile_url: '',
          isAvailable: Math.random() > 0.5,
        });
      }
      return counselors;
    },

    // 모의 리뷰 생성
    generateMockReviews: (count = 10) => {
      const reviews = [];
      for (let i = 1; i <= count; i++) {
        reviews.push({
          review_id: i.toString(),
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

// import axios from 'axios';

// // 환경에 따른 API 기본 URL 설정
// const isDevelopment = import.meta.env
//   ? import.meta.env.MODE === 'development'
//   : process.env.NODE_ENV === 'development';
// const BASE_URL = isDevelopment
//   ? 'http://localhost:8080/api'
//   : 'https://J12D110.p.ssafy.io/api';

// // axios 인스턴스 생성
// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000, // 10초 타임아웃 설정
// });

// // 요청 인터셉터 설정 - 토큰 추가
// apiClient.interceptors.request.use(
//   config => {
//     const token =
//       sessionStorage.getItem('token') || localStorage.getItem('accessToken');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => Promise.reject(error),
// );

// // 응답 인터셉터 설정 - 에러 처리
// apiClient.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     // 401 에러 (인증 실패) 처리
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         // 토큰 갱신 로직
//         const refreshToken =
//           sessionStorage.getItem('refreshToken') ||
//           localStorage.getItem('refreshToken');

//         if (!refreshToken) {
//           // 리프레시 토큰이 없으면 로그아웃 처리
//           sessionStorage.removeItem('token');
//           sessionStorage.removeItem('user');
//           sessionStorage.removeItem('refreshToken');

//           // 로그아웃 이벤트 발생
//           const logoutEvent = new CustomEvent('auth:logout');
//           window.dispatchEvent(logoutEvent);

//           return Promise.reject(error);
//         }

//         // 토큰 갱신 요청
//         const response = await axios.post(
//           `${BASE_URL}/auth/token/refresh`,
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${refreshToken}`,
//             },
//           },
//         );

//         // 새 토큰 저장
//         const { accessToken, refreshToken: newRefreshToken } = response.data;
//         sessionStorage.setItem('token', accessToken);

//         if (newRefreshToken) {
//           sessionStorage.setItem('refreshToken', newRefreshToken);
//         }

//         // 원래 요청 재시도
//         originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
//         return axios(originalRequest);
//       } catch (refreshError) {
//         // 토큰 갱신 실패 시 로그아웃 처리
//         sessionStorage.removeItem('token');
//         sessionStorage.removeItem('user');
//         sessionStorage.removeItem('refreshToken');

//         // 로그아웃 이벤트 발생
//         const logoutEvent = new CustomEvent('auth:logout');
//         window.dispatchEvent(logoutEvent);

//         return Promise.reject(refreshError);
//       }
//     }

//     // API 에러 응답 포맷팅
//     if (error.response && error.response.data) {
//       return Promise.reject({
//         status: error.response.status,
//         ...error.response.data,
//         message:
//           error.response.data.message ||
//           error.response.data.error ||
//           '요청 처리 중 오류가 발생했습니다.',
//       });
//     }

//     // 네트워크 오류
//     if (error.message === 'Network Error') {
//       return Promise.reject({
//         message: '서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.',
//       });
//     }

//     // 타임아웃 오류
//     if (error.code === 'ECONNABORTED') {
//       return Promise.reject({
//         message: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.',
//       });
//     }

//     return Promise.reject(error);
//   },
// );

// /**
//  * 상담방 관련 API 서비스
//  */
// const counselorChannel = {
//   /**
//    * 상담사 목록 조회
//    * @param {Object} params - 필터링 및 페이징 파라미터
//    * @returns {Promise<Object>} 상담사 목록 및 페이징 정보
//    */
//   getCounselors: async (params = {}) => {
//     try {
//       const response = await apiClient.get('/counselors', { params });
//       return response.data;
//     } catch (error) {
//       console.error('상담사 목록 조회 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담사 상세 정보 조회
//    * @param {string|number} counselorId - 상담사 ID
//    * @returns {Promise<Object>} 상담사 상세 정보
//    */
//   getCounselorDetails: async counselorId => {
//     try {
//       const response = await apiClient.get(`/counselors/${counselorId}`);
//       return response.data;
//     } catch (error) {
//       console.error('상담사 상세 정보 조회 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담사 리뷰 조회
//    * @param {string|number} counselorId - 상담사 ID
//    * @param {Object} params - 페이징 및 정렬 파라미터
//    * @returns {Promise<Object>} 리뷰 목록 및 페이징 정보
//    */
//   getCounselorReviews: async (counselorId, params = {}) => {
//     try {
//       const response = await apiClient.get(
//         `/counselors/${counselorId}/reviews`,
//         { params },
//       );
//       return response.data;
//     } catch (error) {
//       console.error('상담사 리뷰 조회 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담방 생성
//    * @param {Object} channelData - 상담방 생성 데이터
//    * @returns {Promise<Object>} 생성된 상담방 정보
//    */
//   createChannel: async channelData => {
//     try {
//       const response = await apiClient.post('/counselor-channels', channelData);
//       return response.data;
//     } catch (error) {
//       console.error('상담방 생성 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담방 목록 조회
//    * @param {Object} params - 필터링 및 페이징 파라미터
//    * @returns {Promise<Object>} 상담방 목록 및 페이징 정보
//    */
//   getChannels: async (params = {}) => {
//     try {
//       const response = await apiClient.get('/counselor-channels', { params });
//       return response.data;
//     } catch (error) {
//       console.error('상담방 목록 조회 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담방 상세 정보 조회
//    * @param {string|number} channelId - 상담방 ID
//    * @returns {Promise<Object>} 상담방 상세 정보
//    */
//   getChannelDetails: async channelId => {
//     try {
//       const response = await apiClient.get(`/counselor-channels/${channelId}`);
//       return response.data;
//     } catch (error) {
//       console.error('상담방 상세 정보 조회 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담방 입장 요청
//    * @param {string|number} channelId - 상담방 ID
//    * @param {Object} userData - 사용자 정보 (이름, 생년월일 등)
//    * @returns {Promise<Object>} 요청 결과
//    */
//   requestChannelEntry: async (channelId, userData) => {
//     try {
//       const response = await apiClient.post(
//         `/counselor-channels/${channelId}/request`,
//         userData,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('상담방 입장 요청 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 입장 요청 목록 조회 (상담사용)
//    * @param {string|number} channelId - 상담방 ID
//    * @returns {Promise<Object>} 입장 요청 목록
//    */
//   getEntryRequests: async channelId => {
//     try {
//       const response = await apiClient.get(
//         `/counselor-channels/${channelId}/requests`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('입장 요청 목록 조회 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 입장 요청 수락/거절
//    * @param {string|number} channelId - 상담방 ID
//    * @param {string|number} requestId - 요청 ID
//    * @param {string} status - 'accept' 또는 'reject'
//    * @returns {Promise<Object>} 처리 결과
//    */
//   approveChannelRequest: async (channelId, requestId, status) => {
//     try {
//       const response = await apiClient.post(
//         `/counselor-channels/${channelId}/approve`,
//         { status },
//         { params: { request_id: requestId } },
//       );
//       return response.data;
//     } catch (error) {
//       console.error('입장 요청 처리 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담방 입장 (연결)
//    * @param {string|number} channelId - 상담방 ID
//    * @returns {Promise<Object>} 입장 결과 및 방 정보
//    */
//   connectToChannel: async channelId => {
//     try {
//       const response = await apiClient.post(
//         `/counselor-channels/${channelId}/connect`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('상담방 입장 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담 세션 종료
//    * @param {string|number} channelId - 상담방 ID
//    * @returns {Promise<Object>} 종료 결과
//    */
//   endCounselingSession: async channelId => {
//     try {
//       const response = await apiClient.post(
//         `/counselor-channels/${channelId}/end`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('상담 세션 종료 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 상담 리뷰 작성
//    * @param {string|number} sessionId - 상담 세션 ID
//    * @param {Object} reviewData - 리뷰 데이터 (평점, 내용)
//    * @returns {Promise<Object>} 리뷰 작성 결과
//    */
//   submitCounselingReview: async (sessionId, reviewData) => {
//     try {
//       const response = await apiClient.post('/counseling-review', reviewData, {
//         params: { session_id: sessionId },
//       });
//       return response.data;
//     } catch (error) {
//       console.error('상담 리뷰 작성 오류:', error);
//       throw error;
//     }
//   },

//   /**
//    * 모의 API 데이터 생성 (개발용)
//    */
//   mockData: {
//     // 모의 상담사 목록 생성
//     generateMockCounselors: (count = 8) => {
//       const counselors = [];
//       for (let i = 1; i <= count; i++) {
//         counselors.push({
//           id: i,
//           name: `상담사 ${i}`,
//           title: '심리 상담 전문가',
//           specialty: ['자존감 향상', '가족 관계', '직장 문제', '학업 스트레스'][
//             i % 4
//           ],
//           bio: '전문적인 심리 상담을 제공합니다.',
//           years: Math.floor(Math.random() * 15) + 3,
//           certifications: ['심리상담사 1급', '가족상담사 2급'],
//           rating_avg: (Math.random() * 1.5 + 3.5).toFixed(1),
//           review_count: Math.floor(Math.random() * 50) + 5,
//           status: Math.random() > 0.5 ? '가능' : '불가능',
//           profile_url: '',
//           isAvailable: Math.random() > 0.5,
//         });
//       }
//       return counselors;
//     },

//     // 모의 리뷰 생성
//     generateMockReviews: (count = 10) => {
//       const reviews = [];
//       for (let i = 1; i <= count; i++) {
//         reviews.push({
//           review_id: i.toString(),
//           user_nickname: `사용자${i}`,
//           content: '상담이 매우 도움이 되었습니다. 감사합니다.',
//           score: Math.floor(Math.random() * 2) + 4,
//           created_at: new Date(Date.now() - i * 86400000).toISOString(),
//         });
//       }
//       return reviews;
//     },
//   },
// };

// export default counselorChannel;
