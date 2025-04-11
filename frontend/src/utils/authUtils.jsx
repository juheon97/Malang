/**
 * 인증 관련 유틸리티 함수 모음
 */

/**
 * 비밀번호 유효성 검사
 * 백엔드 요구사항과 일치: 최소 8자, 영문자, 숫자, 특수문자 포함
 *
 * @param {string} password 검사할 비밀번호
 * @returns {boolean} 유효성 여부
 */
export const validatePassword = password => {
  // SignupRequest.java에 정의된 정규식과 동일한 패턴
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
};

/**
 * 이메일 유효성 검사
 *
 * @param {string} email 검사할 이메일
 * @returns {boolean} 유효성 여부
 */
export const validateEmail = email => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * 비밀번호 강도 측정
 *
 * @param {string} password 비밀번호
 * @returns {string} 'weak', 'medium', 'strong' 중 하나
 */
export const getPasswordStrength = password => {
  if (!password) return 'weak';

  let score = 0;

  // 길이 점수
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // 복잡성 점수
  if (/[A-Z]/.test(password)) score += 1; // 대문자
  if (/[a-z]/.test(password)) score += 1; // 소문자
  if (/[0-9]/.test(password)) score += 1; // 숫자
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // 특수문자

  // 강도 결정
  if (score < 4) return 'weak';
  if (score < 6) return 'medium';
  return 'strong';
};

/**
 * 닉네임 유효성 검사
 *
 * @param {string} nickname 검사할 닉네임
 * @returns {boolean} 유효성 여부
 */
export const validateNickname = nickname => {
  return nickname && nickname.length >= 2 && nickname.length <= 20;
};

/**
 * 토큰에서 만료 시간 추출
 *
 * @param {string} token JWT 토큰
 * @returns {number|null} 만료 시간(초) 또는 null
 */
export const getTokenExpirationTime = token => {
  if (!token) return null;

  try {
    // JWT 토큰은 header.payload.signature 형식
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    const { exp } = JSON.parse(jsonPayload);
    return exp;
  } catch (error) {
    console.error('토큰 해석 실패:', error);
    return null;
  }
};

/**
 * 토큰이 만료되었는지 확인
 *
 * @param {string} token JWT 토큰
 * @returns {boolean} 만료 여부
 */
export const isTokenExpired = token => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return true;

  // 현재 시간과 비교 (버퍼 5분 추가)
  return Date.now() >= (expirationTime - 300) * 1000;
};

/**
 * 사용자 역할에 따른 리다이렉트 경로 결정
 *
 * @param {string} role 사용자 역할
 * @returns {string} 리다이렉트할 경로
 */
export const getRedirectPathByRole = role => {
  switch (role) {
    case 'ROLE_COUNSELOR':
    case 'counselor':
      return '/counselor/dashboard';
    case 'ROLE_USER':
    case 'user':
      return '/home';
    default:
      return '/';
  }
};
