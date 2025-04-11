import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * 상담사 프로필 관련 API 서비스
 */
const counselorApi = {
  /**
   * 상담사 프로필 조회
   * @returns {Promise} 상담사 프로필 정보
   */
  getCounselorProfile: async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 환경 변수에서 base URL 사용
      const response = await axios.get(`${BASE_URL}/counselor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('상담사 프로필 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 상담사 프로필 업데이트
   * @param {Object} profileData 업데이트할 프로필 데이터
   * @returns {Promise} 업데이트된 상담사 프로필 정보
   */
  updateCounselorProfile: async profileData => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 환경 변수에서 base URL 사용
      const response = await axios.put(
        `${BASE_URL}/counselor/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('상담사 프로필 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 상담사 자격증 정보만 업데이트
   * @param {Boolean} hasCertification 자격증 보유 여부
   * @returns {Promise} 업데이트된 상담사 프로필 정보
   */
  updateCertification: async hasCertification => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 환경 변수에서 base URL 사용
      const response = await axios.put(
        `${BASE_URL}/counselor/profile/certification`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { hasCertification },
        },
      );

      return response.data;
    } catch (error) {
      console.error('상담사 자격증 정보 업데이트 실패:', error);
      throw error;
    }
  },
};

export default counselorApi;
