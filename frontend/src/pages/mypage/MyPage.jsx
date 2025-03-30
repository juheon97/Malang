import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const MyPage = () => {
  const auth = useAuth();
  const { currentUser } = auth || {};
  const [profile, setProfile] = useState({
    speciality: '',
    specialty: '', // specialty 필드 추가
    years: 0,
    bio: '',
    profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
    hasCertification: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 초기 로딩 상태 추가

  // 자격증 업데이트 중인지 상태
  const [updatingCertification, setUpdatingCertification] = useState(false);

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    if (currentUser) {
      console.log(
        '현재 사용자 객체 전체 구조:',
        JSON.stringify(currentUser, null, 2),
      );
      // 토큰 확인
      console.log('저장된 토큰:', sessionStorage.getItem('token'));
      console.log('API URL:', import.meta.env.VITE_API_URL);
    }
  }, [currentUser]);

  // mockUsers에서 상담사 정보 가져오기
  useEffect(() => {
    if (currentUser?.id) {
      try {
        // 먼저 세션 스토리지에서 user 정보 확인
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        console.log('현재 로그인된 유저 정보:', storedUser);

        // 기본 정보라도 설정
        setUserDetails({
          id: storedUser.id || currentUser.id,
          name: storedUser.username || currentUser.username,
          role: storedUser.role || currentUser.role,

          gender: 'M', // 기본값
          birth_date: '정보 없음', // 기본값
        });

        // 그 다음 mockUsers에서도 확인 (혹시 있을 경우)
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

  useEffect(() => {
    // 프로필 정보 불러오기
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        console.log(`API 호출 URL: /api/counselor/profile`);

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
            });
          } else {
            // 기본값 설정
            setProfile({
              speciality: '',
              specialty: '',
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

          console.log('백엔드 API 응답 구조:', response.data);

          if (response.data) {
            // years 문자열에서 숫자 추출하기기
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
        setIsInitialLoading(false); // 초기 로딩 완료
      }
    };

    fetchProfile();
  }, [currentUser]);

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

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // 프로필 이미지 미리보기
    const reader = new FileReader();
    reader.onload = () => {
      setProfile({
        ...profile,
        profile_url: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  // 자격증 정보 업데이트 함수
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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

  const handleSubmit = async () => {
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

        // 업데이트할 프로필 데이터 준비 - specialty와 speciality 모두 업데이트
        const updatedProfile = {
          ...currentProfile,
          speciality: profile.speciality,
          specialty: profile.speciality, // specialty 필드 추가
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        // API 요청 데이터 구성 (백엔드 DTO에 맞게 필드명 조정)
        const requestData = {
          nickname: currentUser.username || userDetails?.name,
          specialty: profile.speciality, // specialty 필드 사용
          speciality: profile.speciality, // 혹시 모를 호환성을 위해 speciality도 전송
          years: `${profile.years}년`,
          bio: profile.bio,
          profileUrl: profile.profile_url,
        };

        console.log('프로필 업데이트 요청 URL:', `/api/counselor/profile`);
        console.log('프로필 업데이트 요청 데이터:', requestData);
        console.log('요청 토큰:', sessionStorage.getItem('token'));

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

          // API 응답에서 years 필드 처리 (문자열에서 숫자로 변환)
          let yearsValue = profile.years;
          if (response.data.years) {
            try {
              if (typeof response.data.years === 'string') {
                const yearsMatch = response.data.years.match(/\d+/);
                if (yearsMatch) {
                  yearsValue = parseInt(yearsMatch[0], 10);
                  console.log('변환된 years 값:', yearsValue);
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

  // 현재 사용자의 역할 확인 - 상담사 여부 검사 로직 개선
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

  // 초기 로딩 상태인 경우 로딩 화면 표시
  if (isInitialLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 mt-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 현재 사용자가 상담사가 아니면 권한 없음 메시지 표시
  if (currentUser && !isCounselor()) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 mt-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-yellow-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-yellow-700 font-medium">
              상담사 계정만 이 페이지에 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 현재 사용자가 없으면 로딩 표시
  if (!currentUser) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">마이페이지</h1>
        <p className="text-gray-600">
          정보를 관리하고 프로필을 업데이트하세요.
        </p>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md animate-fadeIn">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md animate-fadeIn">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'profile'
              ? 'text-[#00a173] border-b-2 border-[#00a173]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          프로필 정보
        </button>
      </div>

      {/* 프로필 정보 탭 */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* 왼쪽 사이드바 - 이미지와 기본 정보 */}
            <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
              <div className="flex flex-col items-center">
                <div
                  className="w-36 h-36 rounded-full overflow-hidden cursor-pointer relative group mb-6 border-4 border-white shadow-md"
                  onClick={handleProfileImageClick}
                >
                  <img
                    src={profile.profile_url}
                    alt="프로필 이미지"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-800 font-medium">
                      사진 변경
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {userDetails?.name ||
                    currentUser?.username ||
                    currentUser?.counselor_name ||
                    '상담사'}
                </h2>

                <div className="w-full space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-gray-700">
                        기본 정보
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">성별</span>
                        <span className="font-medium text-gray-800">
                          {(userDetails?.gender || currentUser?.gender) === 'M'
                            ? '남자'
                            : '여자'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">생년월일</span>
                        <span className="font-medium text-gray-800">
                          {userDetails?.birth_date ||
                            currentUser?.birth_date ||
                            '정보 없음'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">자격증</span>
                        <div className="flex items-center">
                          {profile.hasCertification ? (
                            <span className="text-[#00a173] font-medium mr-2">
                              보유
                            </span>
                          ) : (
                            <>
                              <span className="text-gray-500 font-medium mr-2">
                                미보유
                              </span>
                              <button
                                onClick={() => updateCertification(true)}
                                disabled={updatingCertification}
                                className="text-xs bg-[#00a173] text-white px-2 py-1 rounded hover:bg-[#008d63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingCertification
                                  ? '업데이트 중...'
                                  : '자격증 추가'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 메인 컨텐츠 - 상담 정보 */}
            <div className="md:w-2/3 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                전문 정보
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    상담 전문 분야
                  </label>
                  <input
                    type="text"
                    name="speciality"
                    value={profile.speciality}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
                    placeholder="예: 청소년 상담, 가족 상담, 불안장애"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    상담 경력
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="years"
                      value={profile.years}
                      onChange={handleInputChange}
                      className="block w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
                      min="0"
                    />
                    <span className="ml-3 text-gray-700">년</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    자기 소개
                  </label>
                  <div className="relative">
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      rows="6"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
                      placeholder="상담에 대한 당신의 접근 방식, 철학, 전문 분야에 대해 설명해주세요. 상담을 찾는 내담자에게 당신을 소개하는 글입니다."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {profile.bio.length}/500자
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md text-sm font-medium mr-3 hover:bg-gray-300 transition-colors">
                  취소
                </button>
                <button
                  className={`bg-[#00a173] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-[#008d63] transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;

// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import axios from 'axios';

// const MyPage = () => {
//   // AuthContext 체크
//   const auth = useAuth();
//   // 유효하지 않은 경우를 처리
//   if (!auth) {
//     return <div className="w-full max-w-5xl mx-auto p-6 mt-8">로딩 중...</div>;
//   }

//   const { currentUser } = auth;
//   const [profile, setProfile] = useState({
//     speciality: '',
//     years: 0,
//     bio: '',
//     profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const fileInputRef = useRef(null);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [userDetails, setUserDetails] = useState(null);

//   // 추가: sessionStorage에서 직접 상담사 정보 가져오기
//   useEffect(() => {
//     if (currentUser?.id) {
//       // sessionStorage에서 mockCounselors 확인
//       const storedCounselors = JSON.parse(
//         sessionStorage.getItem('mockCounselors') || '[]',
//       );
//       const foundCounselor = storedCounselors.find(
//         c => c.id === currentUser.id,
//       );

//       if (foundCounselor) {
//         console.log('세션스토리지에서 찾은 상담사 정보:', foundCounselor);
//         setUserDetails(foundCounselor);
//       }

//       // sessionStorage에서 mockUsers 확인
//       const storedUsers = JSON.parse(
//         sessionStorage.getItem('mockUsers') || '[]',
//       );
//       const foundUser = storedUsers.find(u => u.user_id === currentUser.id);

//       if (foundUser) {
//         console.log('세션스토리지에서 찾은 사용자 정보:', foundUser);
//         if (!userDetails) {
//           setUserDetails(foundUser);
//         }
//       }
//     }
//   }, [currentUser]);

//   useEffect(() => {
//     // 프로필 정보 불러오기
//     const fetchProfile = async () => {
//       if (!currentUser) return;
//       console.log('현재 사용자 정보:', currentUser);

//       try {
//         setLoading(true);

//         // API 요청을 통해 상담사 프로필 정보 가져오기
//         // 모의 API 환경에서는 sessionStorage에서 가져오기
//         const storedProfile = sessionStorage.getItem(
//           `counselor_profile_${currentUser.id}`,
//         );

//         if (storedProfile) {
//           setProfile(JSON.parse(storedProfile));
//         } else {
//           // 기본값 설정
//           setProfile({
//             speciality: '',
//             years: 0,
//             bio: '',
//             profile_url: 'src/assets/image/mypage/Mypage_profile.svg',
//           });
//         }
//       } catch (err) {
//         console.error('프로필 정보를 불러오는데 실패했습니다:', err);
//         setError('프로필 정보를 불러오는데 실패했습니다.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [currentUser]);

//   const handleInputChange = e => {
//     const { name, value } = e.target;
//     setProfile({
//       ...profile,
//       [name]: value,
//     });
//   };

//   const handleProfileImageClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = e => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // 프로필 이미지 미리보기
//     const reader = new FileReader();
//     reader.onload = () => {
//       setProfile({
//         ...profile,
//         profile_url: reader.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async () => {
//     if (!currentUser) return;

//     try {
//       setLoading(true);
//       setError('');
//       setSuccess('');

//       // 모의 API 환경에서는 sessionStorage에 저장
//       if (import.meta.env.VITE_USE_MOCK_API === 'true') {
//         // 상담사 프로필 저장
//         sessionStorage.setItem(
//           `counselor_profile_${currentUser.id}`,
//           JSON.stringify(profile),
//         );

//         // 상담사 목록에 상담사 추가 또는 업데이트
//         const storedCounselors = JSON.parse(
//           sessionStorage.getItem('mockCounselors') || '[]',
//         );
//         const existingIndex = storedCounselors.findIndex(
//           c => c.id === currentUser.id,
//         );

//         // 상담사 활성 상태 확인 (로그인 여부에 따라 결정)
//         const activeUsers = JSON.parse(
//           sessionStorage.getItem('loggedInUsers') || '[]',
//         );
//         const isActive = activeUsers.includes(currentUser.id);

//         // 생년월일과 성별에 대한 데이터 소스 결정
//         const birthDate =
//           userDetails?.birth_date || currentUser?.birth_date || '';
//         const gender = userDetails?.gender || currentUser?.gender || 'M';

//         const updatedCounselor = {
//           id: currentUser.id,
//           name: currentUser.username || '상담사',
//           title: '심리 상담 전문가',
//           specialty: profile.speciality,
//           bio: profile.bio,
//           years: profile.years,
//           certifications: ['심리상담사'],
//           rating_avg:
//             existingIndex >= 0 ? storedCounselors[existingIndex].rating_avg : 0,
//           review_count:
//             existingIndex >= 0
//               ? storedCounselors[existingIndex].review_count
//               : 0,
//           status: isActive ? '가능' : '불가능', // 로그인 상태에 따라 결정
//           profile_url: profile.profile_url,
//           satisfaction:
//             existingIndex >= 0
//               ? storedCounselors[existingIndex].satisfaction
//               : '0%',
//           gender: gender,
//           birth_date: birthDate,
//           created_at:
//             existingIndex >= 0
//               ? storedCounselors[existingIndex].created_at
//               : new Date().toISOString(),
//         };

//         if (existingIndex >= 0) {
//           storedCounselors[existingIndex] = updatedCounselor;
//         } else {
//           storedCounselors.push(updatedCounselor);
//         }

//         sessionStorage.setItem(
//           'mockCounselors',
//           JSON.stringify(storedCounselors),
//         );

//         setSuccess('프로필이 성공적으로 업데이트되었습니다.');
//       } else {
//         // 실제 API 호출
//         const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
//         await axios.put(
//           `/api/counselor/${currentUser.id}/profile`,
//           profile,
//           {
//             headers: {
//               Authorization: `Bearer ${sessionStorage.getItem('token')}`,
//               'Content-Type': 'application/json',
//             },
//           },
//         );

//         setSuccess('프로필이 성공적으로 업데이트되었습니다.');
//       }
//     } catch (err) {
//       console.error('프로필 업데이트에 실패했습니다:', err);
//       setError('프로필 업데이트에 실패했습니다.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 현재 사용자가 상담사가 아니면 권한 없음 메시지 표시
//   if (currentUser && !currentUser.role.includes('COUNSELOR')) {
//     return (
//       <div className="w-full max-w-5xl mx-auto p-6 mt-8">
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
//           <div className="flex items-center">
//             <svg
//               className="h-6 w-6 text-yellow-500 mr-3"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//               />
//             </svg>
//             <p className="text-yellow-700 font-medium">
//               상담사 계정만 이 페이지에 접근할 수 있습니다.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 현재 사용자가 없으면 로딩 표시
//   if (!currentUser) {
//     return (
//       <div className="w-full max-w-5xl mx-auto p-6 mt-8 flex justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-5xl mx-auto p-6 mt-8">
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">마이페이지</h1>
//         <p className="text-gray-600">
//           상담사 정보를 관리하고 프로필을 업데이트하세요.
//         </p>
//       </div>

//       {/* 알림 메시지 */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md animate-fadeIn">
//           <div className="flex items-center">
//             <svg
//               className="h-5 w-5 text-red-500 mr-2"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <p className="text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {success && (
//         <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md animate-fadeIn">
//           <div className="flex items-center">
//             <svg
//               className="h-5 w-5 text-green-500 mr-2"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//             <p className="text-green-700">{success}</p>
//           </div>
//         </div>
//       )}

//       {/* 탭 네비게이션 */}
//       <div className="flex mb-6 border-b border-gray-200">
//         <button
//           className={`px-6 py-3 font-medium text-sm transition-colors ${
//             activeTab === 'profile'
//               ? 'text-[#00a173] border-b-2 border-[#00a173]'
//               : 'text-gray-500 hover:text-gray-700'
//           }`}
//           onClick={() => setActiveTab('profile')}
//         >
//           프로필 정보
//         </button>

//         <button
//           className={`px-6 py-3 font-medium text-sm transition-colors ${
//             activeTab === 'settings'
//               ? 'text-[#00a173] border-b-2 border-[#00a173]'
//               : 'text-gray-500 hover:text-gray-700'
//           }`}
//           onClick={() => setActiveTab('settings')}
//         >
//           설정
//         </button>
//       </div>

//       {/* 프로필 정보 탭 */}
//       {activeTab === 'profile' && (
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="md:flex">
//             {/* 왼쪽 사이드바 - 이미지와 기본 정보 */}
//             <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
//               <div className="flex flex-col items-center">
//                 <div
//                   className="w-36 h-36 rounded-full overflow-hidden cursor-pointer relative group mb-6 border-4 border-white shadow-md"
//                   onClick={handleProfileImageClick}
//                 >
//                   <img
//                     src={profile.profile_url}
//                     alt="프로필 이미지"
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                     <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-800 font-medium">
//                       사진 변경
//                     </div>
//                   </div>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     className="hidden"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                   />
//                 </div>

//                 <h2 className="text-xl font-bold text-gray-800 mb-1">
//                   {currentUser?.username ||
//                     currentUser?.counselor_name ||
//                     userDetails?.name ||
//                     '상담사'}
//                 </h2>
//                 <p className="text-[#00a173] font-medium mb-6">
//                   심리 상담 전문가
//                 </p>

//                 <div className="w-full space-y-4">
//                   <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//                     <div className="flex items-center mb-3">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5 text-gray-500 mr-2"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                         />
//                       </svg>
//                       <h3 className="text-sm font-semibold text-gray-700">
//                         기본 정보
//                       </h3>
//                     </div>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">성별</span>
//                         <span className="font-medium text-gray-800">
//                           {(userDetails?.gender || currentUser?.gender) === 'M'
//                             ? '남자'
//                             : '여자'}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">생년월일</span>
//                         <span className="font-medium text-gray-800">
//                           {userDetails?.birth_date ||
//                             currentUser?.birth_date ||
//                             '정보 없음'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* 오른쪽 메인 컨텐츠 - 상담 정보 */}
//             <div className="md:w-2/3 p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-6">
//                 전문 정보
//               </h3>

//               <div className="space-y-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     상담 전문 분야
//                   </label>
//                   <input
//                     type="text"
//                     name="speciality"
//                     value={profile.speciality}
//                     onChange={handleInputChange}
//                     className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
//                     placeholder="예: 청소년 상담, 가족 상담, 불안장애"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     상담 경력
//                   </label>
//                   <div className="flex items-center">
//                     <input
//                       type="number"
//                       name="years"
//                       value={profile.years}
//                       onChange={handleInputChange}
//                       className="block w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
//                       min="0"
//                     />
//                     <span className="ml-3 text-gray-700">년</span>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     자기 소개
//                   </label>
//                   <div className="relative">
//                     <textarea
//                       name="bio"
//                       value={profile.bio}
//                       onChange={handleInputChange}
//                       rows="6"
//                       className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00a173] focus:border-[#00a173] sm:text-sm"
//                       placeholder="상담에 대한 당신의 접근 방식, 철학, 전문 분야에 대해 설명해주세요. 상담을 찾는 내담자에게 당신을 소개하는 글입니다."
//                     />
//                     <div className="absolute bottom-3 right-3 text-xs text-gray-400">
//                       {profile.bio.length}/500자
//                     </div>
//                   </div>
//                 </div>

//                 <div className="pt-4">
//                   <h4 className="text-sm font-medium text-gray-700 mb-3">
//                     자격증 (선택사항)
//                   </h4>
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     <div className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700 flex items-center">
//                       심리상담사
//                       <button className="ml-1 text-gray-400 hover:text-gray-600">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-4 w-4"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M6 18L18 6M6 6l12 12"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                   <button className="text-sm text-[#00a173] hover:text-[#008d63] flex items-center">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 mr-1"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                       />
//                     </svg>
//                     자격증 추가
//                   </button>
//                 </div>
//               </div>

//               <div className="mt-8 flex justify-end">
//                 <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md text-sm font-medium mr-3 hover:bg-gray-300 transition-colors">
//                   취소
//                 </button>
//                 <button
//                   className={`bg-[#00a173] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-[#008d63] transition-colors ${
//                     loading ? 'opacity-70 cursor-not-allowed' : ''
//                   }`}
//                   onClick={handleSubmit}
//                   disabled={loading}
//                 >
//                   {loading ? '저장 중...' : '변경사항 저장'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 설정 탭 */}
//       {activeTab === 'settings' && (
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               계정 설정
//             </h3>
//             <p className="text-gray-600 text-sm">
//               계정 관련 설정을 관리하세요.
//             </p>
//           </div>

//           <div className="space-y-6">
//             <div className="pb-6 border-b border-gray-200">
//               <h4 className="text-md font-medium text-gray-700 mb-3">
//                 알림 설정
//               </h4>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-800">이메일 알림</p>
//                     <p className="text-xs text-gray-500">
//                       새로운 상담 요청이 있을 때 이메일 알림을 받습니다.
//                     </p>
//                   </div>
//                   <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                     <input
//                       type="checkbox"
//                       name="email_noti"
//                       id="email_noti"
//                       className="checked:bg-[#00a173] outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
//                     />
//                     <label
//                       htmlFor="email_noti"
//                       className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
//                     ></label>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-800">SMS 알림</p>
//                     <p className="text-xs text-gray-500">
//                       새로운 상담 요청이 있을 때 SMS 알림을 받습니다.
//                     </p>
//                   </div>
//                   <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                     <input
//                       type="checkbox"
//                       name="sms_noti"
//                       id="sms_noti"
//                       className="checked:bg-[#00a173] outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
//                     />
//                     <label
//                       htmlFor="sms_noti"
//                       className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
//                     ></label>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="pb-6 border-b border-gray-200">
//               <h4 className="text-md font-medium text-gray-700 mb-3">
//                 계정 보안
//               </h4>
//               <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors">
//                 비밀번호 변경
//               </button>
//             </div>

//             <div>
//               <h4 className="text-md font-medium text-red-600 mb-3">
//                 계정 삭제
//               </h4>
//               <p className="text-sm text-gray-500 mb-3">
//                 계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은
//                 되돌릴 수 없습니다.
//               </p>
//               <button className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md transition-colors">
//                 계정 삭제
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyPage;
