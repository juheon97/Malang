import { useState, useEffect } from 'react';
import counselorChannel from '../../../api/counselorChannel';

// 상담사 더미 데이터 (API 실패 시 대체용)
const dummyCounselors = [
  {
    id: 1,
    name: '다혜 상담사',
    title: '심리 상담 전문가',
    specialty: '자존감 향상',
    speciality: '자존감 향상',
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
  // 필요한 경우 더 많은 더미 데이터 추가
];

/**
 * 상담사 데이터를 관리하기 위한 커스텀 훅
 */
const useCounselors = () => {
  const [counselors, setCounselors] = useState([]);
  const [displayCounselors, setDisplayCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    specialty: '',
    min_rating: 0,
    page: 0,
    size: 10,
  });

  // 상담사 목록 조회 함수
  const fetchCounselors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        // 모의 API 환경 처리 (필요한 경우 구현)
        setCounselors(dummyCounselors);
      } else {
        // 실제 API 호출 - 타임스탬프 추가하여 캐싱 방지
        const updatedFilters = {
          ...filters,
          _timestamp: new Date().getTime(),
        };

        const response = await counselorChannel.getChannels(updatedFilters);
        console.log('상담사 목록 응답:', response);

        // Spring Data Page 응답 구조 처리
        if (response && response.content) {
          console.log('콘텐츠:', response.content);
          // content 배열이 비어있고 totalElements가 있는 경우 더미 데이터 사용
          if (response.content.length === 0 && response.totalElements > 0) {
            console.log(
              '콘텐츠는 비어있지만 totalElements가 있음:',
              response.totalElements,
            );
            // 더미 데이터에서 totalElements 개수만큼 가져와서 사용
            setCounselors(dummyCounselors.slice(0, response.totalElements));
          } else {
            // content 배열에 데이터가 있는 경우
            setCounselors(response.content);
          }
        } else {
          // 다른 형태의 응답 처리 (예외 상황)
          console.warn('예상치 못한 응답 형식:', response);
          setCounselors([]);
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

  // 필터 변경 핸들러
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 0, // 필터 변경 시 항상 첫 페이지로
    }));
  };

  // 초기 및 필터 변경 시 상담사 목록 조회
  useEffect(() => {
    fetchCounselors();
  }, [filters]);

  // counselors 상태가 변경될 때마다 displayCounselors 업데이트
  useEffect(() => {
    if (counselors.length > 0) {
      const mapped = counselors.map(c => {
        // 자격증 여부 확인 추가
        let hasCertification = false;
        if (c.certifications && c.certifications.length > 0) {
          hasCertification = c.certifications[0] === 'Y';
        } else if (c.hasCertification !== undefined) {
          hasCertification = c.hasCertification;
        }

        // specialty와 speciality 필드 처리
        const specialtyValue = c.specialty || c.speciality || '';

        return {
          ...c,
          isAvailable: c.status === '가능',
          hasCertification: hasCertification, // 자격증 보유 여부 추가
          personalHistory: `${c.experience || c.years || 0}년`,
          satisfaction: `${Math.round(((c.satisfactionRate || c.rating_avg * 20 || 90) / 100) * 100)}%`,
          rating: c.rating_avg || 4.5,
          bio: c.bio || c.shortIntro || c.description || '저한테 상담받으세요~',
          specialty: specialtyValue, // specialty 필드 통일
          speciality: specialtyValue, // speciality 필드도 함께 업데이트
        };
      });
      console.log('처리된 상담사 목록:', mapped);
      setDisplayCounselors(mapped);
    } else {
      setDisplayCounselors(dummyCounselors);
    }
  }, [counselors]);

  // 새로 고침 함수
  const refreshCounselors = () => {
    fetchCounselors();
  };

  return {
    counselors: displayCounselors,
    isLoading,
    error,
    filters,
    handleFilterChange,
    refreshCounselors,
  };
};

export default useCounselors;
