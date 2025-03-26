import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const API_URL = isDevelopment
  ? 'http://localhost:8080/api'
  : 'https://J12D110.p.ssafy.io/api';

// 환경 변수에서 모의 API 사용 여부 가져옴
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 설정
});

// 요청 인터셉터 설정 - 토큰 추가
api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 설정 - 에러 처리 및 토큰 만료 관리
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 토큰 만료 오류 (401) 처리 및 재시도 로직
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' // 로그인 요청일 때는 리디렉션하지 않음
    ) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 로직 활성화
        const refreshToken = sessionStorage.getItem('refreshToken');

        if (!refreshToken) {
          // refreshToken이 없으면 로그아웃 처리
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('refreshToken');

          // React Router의 navigate 사용을 위해 이벤트 발생 (window.location.href 대신)
          const logoutEvent = new CustomEvent('auth:logout');
          window.dispatchEvent(logoutEvent);

          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_URL}/auth/token/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 새 토큰 저장
        sessionStorage.setItem('token', accessToken);

        if (newRefreshToken) {
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }

        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');

        // React Router의 navigate 사용을 위해 이벤트 발생 (window.location.href 대신)
        const logoutEvent = new CustomEvent('auth:logout');
        window.dispatchEvent(logoutEvent);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// 모의 데이터베이스 - sessionStorage에 사용자 정보 저장
const mockDb = {
  getUsers: () => {
    try {
      const users = JSON.parse(sessionStorage.getItem('mockUsers')) || [];
      return users;
    } catch (e) {
      console.error('Error getting mock users:', e);
      return [];
    }
  },

  saveUser: user => {
    try {
      const users = mockDb.getUsers();
      users.push(user);
      sessionStorage.setItem('mockUsers', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving mock user:', e);
    }
  },

  findUserByEmail: email => {
    const users = mockDb.getUsers();
    return users.find(user => user.user_email === email);
  },
};

// 비밀번호 유효성 검사를 위한 정규식 (백엔드 요구사항과 일치)
const validatePassword = password => {
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
};

// 모의 API 구현
const mockApi = {
  // 일반 사용자 회원가입
  registerUser: async userData => {
    console.log('Mock: 일반 사용자 회원가입', userData);

    // 비밀번호 유효성 검사
    if (!validatePassword(userData.password)) {
      throw {
        response: {
          data: {
            message:
              '비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자를 포함해야 합니다.',
          },
        },
      };
    }

    // 이메일 중복 확인
    if (mockDb.findUserByEmail(userData.user_email)) {
      throw { response: { data: { message: '이미 사용 중인 이메일입니다.' } } };
    }

    // 새 사용자 생성
    const newUser = {
      role: 'user',
      user_id: Date.now(), // 임의의 ID 생성
      user_nickname: userData.nickname,
      user_email: userData.user_email,
      password: userData.password, // 실제로는 해시 처리해야 함
      disability_status: userData.isVisuallyImpaired,
      created_at: new Date().toISOString(),
    };

    // 사용자 저장
    mockDb.saveUser(newUser);

    // 비밀번호를 제외한 정보 반환
    const { password, ...userWithoutPassword } = newUser;
    return {
      data: {
        userId: userWithoutPassword.user_id,
        email: userWithoutPassword.user_email,
        nickname: userWithoutPassword.user_nickname,
        message: '회원가입이 성공적으로 완료되었습니다.',
      },
    };
  },

  // 상담사 회원가입
  registerCounselor: async userData => {
    console.log('Mock: 상담사 회원가입', userData);

    // 비밀번호 유효성 검사
    if (!validatePassword(userData.password)) {
      throw {
        response: {
          data: {
            message:
              '비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자를 포함해야 합니다.',
          },
        },
      };
    }

    // 이메일 중복 확인
    if (mockDb.findUserByEmail(userData.user_email)) {
      throw { response: { data: { message: '이미 사용 중인 이메일입니다.' } } };
    }

    // 새 상담사 생성
    const counselorId = Date.now(); // 임의의 ID 생성
    const newCounselor = {
      role: 'counselor',
      user_id: counselorId,
      counselor_name: userData.counselor_name,
      user_email: userData.user_email,
      password: userData.password, // 실제로는 해시 처리해야 함
      gender: userData.counselor_gender,
      certification: userData.certification,
      birth_date: userData.counselor_birthdate,
      created_at: new Date().toISOString(),
    };

    // 사용자 저장
    mockDb.saveUser(newCounselor);

    // 비밀번호를 제외한 정보 반환
    const { password, ...counselorWithoutPassword } = newCounselor;
    return {
      data: {
        userId: counselorWithoutPassword.user_id,
        email: counselorWithoutPassword.user_email,
        name: counselorWithoutPassword.counselor_name,
        message: '회원가입이 성공적으로 완료되었습니다.',
      },
    };
  },

  // 로그인
  login: async (email, password) => {
    console.log('Mock: 로그인', { email, password });

    // 이메일로 사용자 찾기
    const user = mockDb.findUserByEmail(email);

    if (!user) {
      throw { response: { data: { message: '등록되지 않은 이메일입니다.' } } };
    }

    if (user.password !== password) {
      throw {
        response: { data: { message: '비밀번호가 일치하지 않습니다.' } },
      };
    }

    // JWT 토큰 생성 (실제로는 서버에서 수행)
    const accessToken = `mock-access-token-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${Date.now()}`;

    // 로그인 성공 응답
    return {
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600, // 1시간
        userId: user.user_id.toString(),
        nickname: user.user_nickname || user.counselor_name,
        role: user.role,
        token: accessToken, // 기존 코드와 호환성 유지
      },
    };
  },

  // 토큰 갱신
  refreshToken: async refreshToken => {
    console.log('Mock: 토큰 갱신', { refreshToken });

    // 실제로는 토큰 검증 로직이 필요함
    if (!refreshToken || !refreshToken.startsWith('mock-refresh-token-')) {
      throw {
        response: { data: { message: '유효하지 않은 리프레시 토큰입니다.' } },
      };
    }

    // 새 토큰 발급
    const accessToken = `mock-access-token-${Date.now()}`;
    const newRefreshToken = `mock-refresh-token-${Date.now()}`;

    return {
      data: {
        accessToken: accessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600, // 1시간
      },
    };
  },
};

// 환경 변수에 따라 실제 API 또는 모의 API 선택
const authApi = USE_MOCK_API
  ? mockApi
  : {
      // 일반 사용자 회원가입
      registerUser: async userData => {
        return api.post('/auth/signup', {
          email: userData.user_email,
          password: userData.password,
          nickname: userData.nickname,
          profileUrl: null, // 선택적 필드
        });
      },

      // 상담사 회원가입
      registerCounselor: async userData => {
        const birthDateParts = userData.counselor_birthdate.split('-');
        return api.post('/auth/signup/counselor', {
          email: userData.user_email,
          password: userData.password,
          nickname: userData.counselor_name,
          name: userData.counselor_name,
          gender: userData.counselor_gender,
          birthYear: parseInt(birthDateParts[0]),
          birthMonth: parseInt(birthDateParts[1]),
          birthDay: parseInt(birthDateParts[2]),
          hasCertification: userData.certification,
          profileUrl: null,
        });
      },

      // 로그인
      login: async (email, password) => {
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        // 응답 구조 변환 (백엔드 응답 구조에 맞춤)
        return {
          data: {
            ...response.data,
            token: response.data.accessToken, // 호환성을 위해 token 필드 추가
          },
        };
      },

      // 토큰 갱신
      refreshToken: async refreshToken => {
        return api.post(
          '/auth/token/refresh',
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );
      },
    };

export default authApi;
