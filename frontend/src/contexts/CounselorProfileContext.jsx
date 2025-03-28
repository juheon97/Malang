import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CounselorProfileContext = createContext();

export const CounselorProfileProvider = ({ children }) => {
  const auth = useAuth();
  const { currentUser, isLoading: authLoading } = auth || {};

  const [profile, setProfile] = useState({
    speciality: '',
    years: 0,
    bio: '',
    profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
    hasCertification: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingCertification, setUpdatingCertification] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 사용자가 상담사인지 확인하는 함수
  const isCounselor = () => {
    if (!currentUser) return false;

    // 사용자 역할 확인
    if (typeof currentUser.role === 'string') {
      return currentUser.role.toLowerCase().includes('counselor');
    }

    return false;
  };

  // 프로필 정보 불러오기 함수
  const fetchProfile = async (forceRefresh = false) => {
    // 사용자가 상담사가 아니면 요청을 하지 않음
    if (!isCounselor()) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    // 이미 초기화되어 있고 강제 새로고침이 아니면 건너뛰기
    if (initialized && !forceRefresh) return;

    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        // 모의 API 환경에서는 sessionStorage에서 가져오기
        const storedProfile = sessionStorage.getItem(
          `counselor_profile_${currentUser.id}`,
        );

        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile({
            ...parsedProfile,
            speciality: parsedProfile.specialty || '',

            years: parsedProfile.years
              ? parseInt(parsedProfile.years.replace(/[^0-9]/g, '')) || 0
              : 0,
            hasCertification: parsedProfile.hasCertification || false,
          });
        } else {
          // 기본값 설정
          setProfile({
            speciality: '',
            years: 0,
            bio: '',
            profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
            hasCertification: false,
          });
        }
      } else {
        // 실제 API 호출
        const response = await axios.get(`/api/counselor/profile`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (response.data) {
          // 백엔드 응답 데이터를 프론트엔드 상태에 매핑
          const yearsValue = response.data.years
            ? parseInt(response.data.years.replace(/[^0-9]/g, '')) || 0
            : 0;

          setProfile({
            speciality: response.data.specialty || '',
            years: yearsValue,
            bio: response.data.bio || '',
            profile_url:
              response.data.profileUrl ||
              'src/assets/image/mypage/Mypage_profile.svg',
            hasCertification: response.data.hasCertification || false,
          });
        }
      }

      // 초기화 완료 표시
      setInitialized(true);
    } catch (err) {
      console.error('프로필 정보 요청 오류:', err);
      setError('프로필 정보를 불러오는데 실패했습니다.');

      // 오류가 있어도 초기화 완료로 처리하여 계속된 재시도 방지
      setInitialized(true);
    } finally {
      // 약간의 지연 추가하여 UI 깜빡임 방지
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  // 프로필 정보 업데이트 함수
  const updateProfile = async updatedProfile => {
    if (!currentUser || !isCounselor()) return false;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 디버깅용
      console.log('업데이트할 프로필 정보:', updatedProfile);

      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        // 모의 API 환경에서는 sessionStorage에 저장
        const profileData = {
          specialty: updatedProfile.speciality,
          years: `${updatedProfile.years}년`, // 백엔드 형식에 맞춰 저장
          bio: updatedProfile.bio,
          profile_url: updatedProfile.profile_url,
          hasCertification: updatedProfile.hasCertification,
        };

        sessionStorage.setItem(
          `counselor_profile_${currentUser.id}`,
          JSON.stringify(profileData),
        );

        // 상담사 목록에 상담사 추가 또는 업데이트
        const storedCounselors = JSON.parse(
          sessionStorage.getItem('mockCounselors') || '[]',
        );
        const existingIndex = storedCounselors.findIndex(
          c => c.id === currentUser.id || c.id === parseInt(currentUser.id),
        );

        if (existingIndex >= 0) {
          storedCounselors[existingIndex] = {
            ...storedCounselors[existingIndex],
            specialty: updatedProfile.speciality,
            bio: updatedProfile.bio,
            years: `${updatedProfile.years}년`, // 백엔드 형식에 맞춰 저장
            hasCertification: updatedProfile.hasCertification,
            profile_url: updatedProfile.profile_url,
          };
        } else {
          // 상담사 목록에 없으면 새로 추가
          storedCounselors.push({
            id: currentUser.id,
            name: currentUser.username || '상담사',
            title: '심리 상담 전문가',
            specialty: updatedProfile.speciality,
            bio: updatedProfile.bio,
            years: `${updatedProfile.years}년`, // 백엔드 형식에 맞춰 저장
            hasCertification: updatedProfile.hasCertification,
            profile_url: updatedProfile.profile_url,
            rating_avg: 0,
            review_count: 0,
            status: 'available',
            satisfaction: '0%',
            gender: 'M',
            birth_date: '',
            created_at: new Date().toISOString(),
          });
        }

        sessionStorage.setItem(
          'mockCounselors',
          JSON.stringify(storedCounselors),
        );

        // 상태 업데이트
        setProfile(updatedProfile);
        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
        return true;
      } else {
        // 실제 API 호출
        const requestData = {
          nickname: currentUser.username,
          specialty: updatedProfile.speciality,
          years: `${updatedProfile.years}년`,
          bio: updatedProfile.bio,
        };

        console.log('API 요청 데이터:', requestData);

        const response = await axios.put(
          `/api/counselor/profile`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('API 응답 데이터:', response.data);

        if (response.data) {
          // 응답에서 years 필드 처리 (문자열에서 숫자로 변환)
          const yearsValue = response.data.years
            ? parseInt(response.data.years.replace(/[^0-9]/g, '')) || 0
            : updatedProfile.years;

          // 응답 데이터로 상태 업데이트
          setProfile({
            speciality: response.data.specialty || updatedProfile.speciality,
            years: yearsValue,
            bio: response.data.bio || updatedProfile.bio,
            profile_url: response.data.profileUrl || updatedProfile.profile_url,
            hasCertification:
              response.data.hasCertification || updatedProfile.hasCertification,
          });
          setSuccess('프로필이 성공적으로 업데이트되었습니다.');
          return true;
        }
      }
    } catch (err) {
      console.error('프로필 업데이트에 실패했습니다:', err);
      console.error('오류 상세 정보:', err.response || err.message);
      setError('프로필 업데이트에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 자격증 정보 업데이트 함수
  const updateCertification = async value => {
    if (!currentUser || !isCounselor()) return;

    try {
      setUpdatingCertification(true);
      setError('');
      setSuccess('');

      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        // 모의 API에서 자격증 정보 업데이트
        const updatedProfile = {
          ...profile,
          hasCertification: value,
          specialty: profile.speciality,
        };

        sessionStorage.setItem(
          `counselor_profile_${currentUser.id}`,
          JSON.stringify(updatedProfile),
        );

        // 상담사 목록 업데이트
        const storedCounselors = JSON.parse(
          sessionStorage.getItem('mockCounselors') || '[]',
        );
        const existingIndex = storedCounselors.findIndex(
          c => c.id === currentUser.id || c.id === parseInt(currentUser.id),
        );

        if (existingIndex >= 0) {
          storedCounselors[existingIndex].hasCertification = value;
          sessionStorage.setItem(
            'mockCounselors',
            JSON.stringify(storedCounselors),
          );
        }

        // 상태 업데이트
        setProfile(prev => ({
          ...prev,
          hasCertification: value,
        }));
        setSuccess('자격증 정보가 업데이트되었습니다.');
      } else {
        // 실제 API 호출
        const response = await axios.put(
          `/api/counselor/profile/certification`,
          null,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
            params: { hasCertification: value },
          },
        );

        if (response.data) {
          // 응답으로 받은 데이터로 상태 업데이트
          if (typeof response.data.hasCertification !== 'undefined') {
            setProfile(prev => ({
              ...prev,
              hasCertification: response.data.hasCertification,
            }));
          } else {
            // 응답에 명시적으로 자격증 상태가 없으면 요청한 값 사용
            setProfile(prev => ({
              ...prev,
              hasCertification: value,
            }));
          }
          setSuccess('자격증 정보가 업데이트되었습니다.');
        }
      }
    } catch (err) {
      console.error('자격증 정보 업데이트에 실패했습니다:', err);
      setError('자격증 정보 업데이트에 실패했습니다.');
    } finally {
      setUpdatingCertification(false);
    }
  };

  // 처음 마운트 또는 사용자 변경 시에만 실행 (auth 로딩이 완료된 후)
  useEffect(() => {
    if (authLoading) return;

    // 사용자가 있고 상담사이며 아직 초기화되지 않았으면 프로필 가져오기
    if (currentUser && isCounselor() && !initialized) {
      fetchProfile();
    } else if (currentUser && !isCounselor()) {
      // 상담사가 아닌 경우 로딩 상태 해제
      setLoading(false);
      setInitialized(true);
    }

    // 사용자가 로그아웃했거나 변경된 경우 초기화 상태 리셋
    if (!currentUser && initialized) {
      setInitialized(false);
      setProfile({
        speciality: '',
        years: 0,
        bio: '',
        profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
        hasCertification: false,
      });
    }
  }, [currentUser, authLoading, initialized]);

  // 컨텍스트 값 설정
  const value = {
    profile,
    loading: loading || authLoading, // auth 로딩 중일 때도 로딩 상태로 표시
    error,
    success,
    updatingCertification,
    updateProfile,
    updateCertification,
    fetchProfile,
    setSuccess,
    setError,
    initialized,
    isCounselor: isCounselor(),
  };

  return (
    <CounselorProfileContext.Provider value={value}>
      {children}
    </CounselorProfileContext.Provider>
  );
};

// 커스텀 훅: 상담사 프로필 컨텍스트 사용
export const useCounselorProfile = () => {
  const context = useContext(CounselorProfileContext);
  if (context === undefined) {
    throw new Error(
      'useCounselorProfile must be used within a CounselorProfileProvider',
    );
  }
  return context;
};

export default CounselorProfileContext;
