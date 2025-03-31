import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * 상담사 프로필 데이터를 관리하는 커스텀 훅
 */
const useProfileData = currentUser => {
  const [profile, setProfile] = useState({
    speciality: '',
    specialty: '',
    years: 0,
    bio: '',
    profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
    hasCertification: false,
  });

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [updatingCertification, setUpdatingCertification] = useState(false);

  // 사용자 기본 정보 가져오기
  useEffect(() => {
    if (currentUser?.id) {
      try {
        // 세션 스토리지에서 user 정보 확인
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        console.log('현재 로그인된 유저 정보:', storedUser);

        // 기본 정보 설정
        setUserDetails({
          id: storedUser.id || currentUser.id,
          name: storedUser.username || currentUser.username,
          role: storedUser.role || currentUser.role,
          gender: 'M', // 기본값
          birth_date: '정보 없음', // 기본값
        });

        // mockUsers에서도 확인
        const storedUsers = JSON.parse(
          sessionStorage.getItem('mockUsers') || '[]',
        );

        if (storedUsers && storedUsers.length > 0) {
          const foundUser = storedUsers.find(
            u => u.user_id.toString() === currentUser.id.toString(),
          );

          if (foundUser) {
            console.log('mockUsers에서 찾은 정보:', foundUser);
            setUserDetails(prev => ({
              ...prev,
              ...foundUser,
              gender: foundUser.gender,
              birth_date: foundUser.birth_date,
            }));
          }
        }
      } catch (error) {
        console.error('정보 가져오기 실패:', error);
      }
    }
  }, [currentUser]);

  // 프로필 정보 가져오기
  useEffect(() => {
    // 프로필 정보 불러오기
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        if (import.meta.env.VITE_USE_MOCK_API === 'true') {
          // 모의 API 환경에서는 sessionStorage에서 가져오기
          const storedProfile = sessionStorage.getItem(
            `counselor_profile_${currentUser.id}`,
          );

          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);

            let yearsValue = 0;
            if (parsedProfile.years) {
              try {
                if (typeof parsedProfile.years === 'string') {
                  const yearsMatch = parsedProfile.years.match(/\d+/);
                  if (yearsMatch) {
                    yearsValue = parseInt(yearsMatch[0], 10);
                  }
                } else if (typeof parsedProfile.years === 'number') {
                  yearsValue = parsedProfile.years;
                }
              } catch (error) {
                console.error('years 값 변환 중 오류:', error);
              }
            }

            // speciality와 specialty 모두 확인
            const specialtyValue =
              parsedProfile.specialty || parsedProfile.speciality || '';

            setProfile({
              ...parsedProfile,
              speciality: specialtyValue,
              specialty: specialtyValue,
              years: yearsValue,
              hasCertification: parsedProfile.hasCertification || false,
              profile_url:
                parsedProfile.profile_url ||
                'src/assets/image/mypage/Mypage_profile.svg',
            });
          }
        } else {
          // 실제 API 호출
          const response = await axios.get(`/api/counselor/profile`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          });

          console.log('백엔드 API 응답 구조:', response.data);

          if (response.data) {
            // years 문자열에서 숫자 추출하기
            let yearsValue = 0;
            if (response.data.years) {
              try {
                if (typeof response.data.years === 'string') {
                  const yearsMatch = response.data.years.match(/\d+/);
                  if (yearsMatch) {
                    yearsValue = parseInt(yearsMatch[0], 10);
                  }
                } else if (typeof response.data.years === 'number') {
                  yearsValue = response.data.years;
                }
              } catch (error) {
                console.error('years 값 변환 중 오류:', error);
              }
            }

            // specialty와 speciality 모두 확인
            const specialtyValue =
              response.data.specialty || response.data.speciality || '';

            setProfile({
              speciality: specialtyValue,
              specialty: specialtyValue,
              years: yearsValue,
              bio: response.data.bio || '',
              profile_url:
                response.data.profileUrl ||
                'src/assets/image/mypage/Mypage_profile.svg',
              hasCertification: response.data.hasCertification || false,
            });

            // 사용자 기본 정보 업데이트
            setUserDetails(prev => ({
              ...prev,
              name: response.data.name || prev?.name,
              gender: response.data.gender || prev?.gender,
              birth_date: response.data.formattedBirthdate || prev?.birth_date,
            }));
          }
        }
      } catch (err) {
        console.error('프로필 정보 요청 오류:', err);
        console.error(
          '오류 상세 정보:',
          err.response || err.request || err.message,
        );
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  // 입력 필드 변경 처리
  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name === 'speciality') {
      // speciality가 변경되면 specialty도 함께 업데이트
      setProfile({
        ...profile,
        speciality: value,
        specialty: value,
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  // 프로필 이미지 업데이트
  const updateProfileImage = imageUrl => {
    setProfile(prev => ({
      ...prev,
      profile_url: imageUrl,
    }));
  };

  // 자격증 정보 업데이트
  const updateCertification = async value => {
    if (!currentUser) return;

    try {
      setUpdatingCertification(true);
      setError('');
      setSuccess('');

      // 프로필 상태 업데이트
      setProfile(prev => ({
        ...prev,
        hasCertification: value,
      }));

      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        // 모의 API 환경
        const storedProfile = sessionStorage.getItem(
          `counselor_profile_${currentUser.id}`,
        );
        const currentProfile = storedProfile ? JSON.parse(storedProfile) : {};

        // 업데이트된 프로필 데이터
        const updatedProfile = {
          ...currentProfile,
          hasCertification: value,
        };

        // 세션 스토리지에 저장
        sessionStorage.setItem(
          `counselor_profile_${currentUser.id}`,
          JSON.stringify(updatedProfile),
        );

        // 업데이트 성공 후 플래그 설정
        sessionStorage.setItem('profile_updated', 'true');

        setSuccess('자격증 정보가 업데이트되었습니다.');
      } else {
        // 실제 API 호출
        console.log(
          `자격증 업데이트 API 호출: /api/counselor/profile/certification`,
        );
        console.log('자격증 업데이트 파라미터:', { hasCertification: value });

        const response = await axios.put(
          `/api/counselor/profile/certification`,
          null,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            params: { hasCertification: value },
          },
        );

        console.log('자격증 업데이트 응답:', response.data);

        if (response.data) {
          // 업데이트 성공 후 플래그 설정
          sessionStorage.setItem('profile_updated', 'true');
          setSuccess('자격증 정보가 업데이트되었습니다.');
        }
      }
    } catch (err) {
      console.error('자격증 정보 업데이트에 실패했습니다:', err);
      console.error(
        '자격증 업데이트 오류 상세 정보:',
        err.response || err.request || err.message,
      );
      setError('자격증 정보 업데이트에 실패했습니다.');
      // 실패 시 이전 상태로 되돌림
      setProfile(prev => ({
        ...prev,
        hasCertification: !value,
      }));
    } finally {
      setUpdatingCertification(false);
    }
  };

  // 프로필 정보 저장
  const saveProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 모의 API 환경에서는 sessionStorage에 저장
      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        // 현재 프로필 데이터 가져오기
        const storedProfile = sessionStorage.getItem(
          `counselor_profile_${currentUser.id}`,
        );
        const currentProfile = storedProfile ? JSON.parse(storedProfile) : {};

        // 업데이트할 프로필 데이터 준비
        const updatedProfile = {
          ...currentProfile,
          speciality: profile.speciality,
          specialty: profile.speciality,
          years: profile.years,
          bio: profile.bio,
          profile_url: profile.profile_url,
          hasCertification: profile.hasCertification,
        };

        // 세션 스토리지에 저장
        sessionStorage.setItem(
          `counselor_profile_${currentUser.id}`,
          JSON.stringify(updatedProfile),
        );

        // 업데이트 성공 후 플래그 설정
        sessionStorage.setItem('profile_updated', 'true');

        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        // 실제 API 호출
        // API 요청 데이터 구성
        const requestData = {
          nickname: currentUser.username || userDetails?.name,
          specialty: profile.speciality,
          speciality: profile.speciality,
          years: `${profile.years}년`,
          bio: profile.bio,
          profileUrl: profile.profile_url,
        };

        console.log('프로필 업데이트 요청 URL:', `/api/counselor/profile`);
        console.log('프로필 업데이트 요청 데이터:', requestData);

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

        console.log('프로필 업데이트 응답:', response.data);

        // 응답에서 받은 데이터로 userDetails 업데이트
        if (response.data) {
          setUserDetails(prev => ({
            ...prev,
            name: response.data.name || prev?.name,
            gender: response.data.gender || prev?.gender,
            birth_date: response.data.formattedBirthdate || prev?.birth_date,
          }));

          // API 응답에서 years 필드 처리
          let yearsValue = profile.years;
          if (response.data.years) {
            try {
              if (typeof response.data.years === 'string') {
                const yearsMatch = response.data.years.match(/\d+/);
                if (yearsMatch) {
                  yearsValue = parseInt(yearsMatch[0], 10);
                }
              } else if (typeof response.data.years === 'number') {
                yearsValue = response.data.years;
              }
            } catch (error) {
              console.error('years 값 변환 중 오류:', error);
            }
          }

          // specialty와 speciality 처리
          const specialtyValue =
            response.data.specialty ||
            response.data.speciality ||
            profile.speciality;

          // 프로필 정보도 최신 상태로 업데이트
          setProfile(prev => ({
            ...prev,
            speciality: specialtyValue,
            specialty: specialtyValue,
            years: yearsValue,
            bio: response.data.bio || prev.bio,
            hasCertification:
              response.data.hasCertification || prev.hasCertification,
            profile_url: response.data.profileUrl || prev.profile_url,
          }));
        }

        // 업데이트 성공 후 플래그 설정
        sessionStorage.setItem('profile_updated', 'true');
        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      }
    } catch (err) {
      console.error('프로필 업데이트에 실패했습니다:', err);
      console.error(
        '프로필 업데이트 오류 상세 정보:',
        err.response || err.request || err.message,
      );
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상담사 여부 확인
  const isCounselor = () => {
    if (!currentUser) return false;

    // 여러 가지 방법으로 역할 확인
    // 1. currentUser에서 직접 확인
    if (typeof currentUser.role === 'string') {
      return currentUser.role.toLowerCase().includes('counselor');
    }

    // 2. userDetails에서 확인
    if (userDetails && userDetails.role) {
      return userDetails.role.toLowerCase().includes('counselor');
    }

    return false;
  };

  return {
    profile,
    userDetails,
    loading,
    error,
    success,
    isInitialLoading,
    updatingCertification,
    isCounselor,
    updateCertification,
    handleInputChange,
    updateProfileImage,
    saveProfile,
    setError,
    setSuccess,
  };
};

export default useProfileData;
