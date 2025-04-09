import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupNormal from '../../components/signup/SignupNormal';
import SignupCounselor from '../../components/signup/SignupCounselor';
import myProfile from '../../assets/image/mypage/Mypage_profile.svg';
import authApi from '../../api/authApi';
import {
  validatePassword,
  validateEmail,
  validateNickname,
} from '../../utils/authUtils';

// 배경 이미지 import
import greenCircle from '../../assets/image/signup/signup_green_circle.svg';
import redCircle from '../../assets/image/signup/signup_red_circle.svg';
import yellowCircle from '../../assets/image/signup/signup_yellow_circle.svg';

const profile_url = myProfile;
const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('normal'); // 'normal' 또는 'counselor'

  // 공통 정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 일반 사용자 정보
  const [nickname, setNickname] = useState('');
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState(false);

  // 상담사 정보
  const [name, setName] = useState('');
  const [gender, setGender] = useState('남');
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [hasCertification, setHasCertification] = useState(false);

  // 폼 상태
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // 이미 로그인한 사용자는 홈으로 리다이렉트
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  // 폼 유효성 검사
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // 이메일 검사
    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
      isValid = false;
    }

    // 비밀번호 검사
    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
      isValid = false;
    } else if (!validatePassword(password)) {
      errors.password =
        '비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자를 포함해야 합니다.';
      isValid = false;
    }

    // 비밀번호 확인 검사
    if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }

    // 사용자 유형별 추가 검사
    if (userType === 'normal') {
      if (!nickname.trim()) {
        errors.nickname = '닉네임을 입력해주세요.';
        isValid = false;
      } else if (!validateNickname(nickname)) {
        errors.nickname = '닉네임은 2~20자 사이여야 합니다.';
        isValid = false;
      }
    } else {
      if (!name.trim()) {
        errors.name = '이름을 입력해주세요.';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      if (userType === 'normal') {
        // 일반 사용자 회원가입
        const userData = {
          nickname,
          user_email: email,
          password,
          isVisuallyImpaired,
        };

        response = await authApi.registerUser(userData);
      } else {
        // 상담사 회원가입
        // 생년월일을 YYYY-MM-DD 형식으로 포맷팅
        const formattedBirthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

        const userData = {
          counselor_name: name,
          user_email: email,
          password: password,
          counselor_gender: gender === '남' ? 'M' : 'F', // 성별 포맷 변환
          counselor_birthdate: formattedBirthDate, // 포맷팅된 생년월일 사용
          certification: hasCertification,
        };

        console.log('상담사 회원가입 요청 데이터:', userData);
        console.log('상담사 회원가입 엔드포인트:', '/auth/signup/counselor');

        response = await authApi.registerCounselor(userData);

        // 모의 API 환경에서는 회원가입 후 바로 기본 프로필 정보 저장
        if (import.meta.env.VITE_USE_MOCK_API === 'true') {
          try {
            // 사용자 ID 가져오기 (실제 API 응답에서는 다를 수 있음)
            const userId = response.data?.id || Date.now();

            // 모의 User 데이터 생성
            const mockUser = {
              user_id: userId,
              username: name,
              email: email,
              role: 'ROLE_COUNSELOR',
              gender: gender === '남' ? 'M' : 'F',
              birth_date: formattedBirthDate,
            };

            // 세션 스토리지에 저장
            const storedUsers = JSON.parse(
              sessionStorage.getItem('mockUsers') || '[]',
            );
            storedUsers.push(mockUser);
            sessionStorage.setItem('mockUsers', JSON.stringify(storedUsers));

            // 기본 상담사 프로필 생성
            const counselorProfile = {
              specialty: '', // API는 specialty를 사용하지만 UI는 speciality를 사용
              years: '0',
              bio: '',
              profileUrl: profile_url,
              hasCertification: hasCertification,
            };

            // 세션 스토리지에 프로필 저장
            sessionStorage.setItem(
              `counselor_profile_${userId}`,
              JSON.stringify(counselorProfile),
            );

            // 상담사 목록에도 추가
            const mockCounselors = JSON.parse(
              sessionStorage.getItem('mockCounselors') || '[]',
            );
            mockCounselors.push({
              id: userId,
              name: name,
              title: '심리 상담 전문가',
              specialty: '',
              bio: '',
              years: 0,
              certifications: ['심리상담사'],
              hasCertification: hasCertification,
              rating_avg: 0,
              review_count: 0,
              status: 'available',
              profile_url: profile_url,
              satisfaction: '0%',
              gender: gender === '남' ? 'M' : 'F',
              birth_date: formattedBirthDate,
              created_at: new Date().toISOString(),
            });
            sessionStorage.setItem(
              'mockCounselors',
              JSON.stringify(mockCounselors),
            );

            console.log('모의 환경에 상담사 정보 저장 완료');
          } catch (error) {
            console.error('모의 데이터 저장 중 오류:', error);
          }
        }
      }

      console.log('회원가입 성공:', response.data);

      // 회원가입 성공 시 로그인 페이지로 이동
      alert(
        `${userType === 'normal' ? '일반회원' : '상담사'} 회원가입이 완료되었습니다.`,
      );
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);

      // 서버 에러 메시지 처리
      if (error.response && error.response.data) {
        // 필드 에러 처리
        if (error.response.data.fieldErrors) {
          setFieldErrors(error.response.data.fieldErrors);
        } else {
          setError(error.response.data.message || '회원가입에 실패했습니다.');
        }
      } else {
        setError(
          '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserTypeChange = type => {
    const newType = type === '일반인 사용자' ? 'normal' : 'counselor';
    if (userType !== newType) {
      setUserType(newType);

      // 기존 입력값 초기화
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setFieldErrors({});

      if (newType === 'normal') {
        setNickname('');
        setIsVisuallyImpaired(false);
      } else {
        setName('');
        setGender('남');
        setBirthYear(1990);
        setBirthMonth(1);
        setBirthDay(1);
        setHasCertification(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* 배경 원형 이미지들 */}
      <img
        src={greenCircle}
        alt="Green Circle"
        className="absolute -top-[250px] -right-[350px] z-0 w-[600px] h-[600px]"
      />
      <img
        src={redCircle}
        alt="Red Circle"
        className="absolute top-[300px] -right-[400px] z-0 w-[800px] h-[800px]"
      />
      <img
        src={yellowCircle}
        alt="Yellow Circle"
        className="absolute -top-[150px] -right-[50px] z-0"
      />

      <div className="max-w-[1200px] ml-10 py-10 flex-grow relative z-10">
        <h1 className="text-[#00775c] text-4xl font-bold mb-5">회원가입</h1>
        <div className="w-full h-px bg-gray-200 mb-8"></div>

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-8">
          <button
            className={`py-2.5 px-5 rounded-full cursor-pointer outline-none text-xl min-w-[120px] text-center whitespace-nowrap border-[4px] ${
              userType === 'normal'
                ? 'border-[#92e4d1] text-black shadow-md bg-white'
                : 'border-transparent text-gray-500 bg-white'
            }`}
            onClick={() => handleUserTypeChange('일반인 사용자')}
            type="button"
          >
            일반인 사용자
          </button>
          <button
            className={`py-2.5 px-5 rounded-full cursor-pointer outline-none text-xl min-w-[120px] text-center whitespace-nowrap border-[4px] ${
              userType === 'counselor'
                ? 'border-[#92e4d1] text-black shadow-md bg-white'
                : 'border-transparent text-gray-500 bg-white'
            }`}
            onClick={() => handleUserTypeChange('상담사')}
            type="button"
          >
            상담사
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[800px]">
          {userType === 'normal' ? (
            <SignupNormal
              nickname={nickname}
              setNickname={setNickname}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              isVisuallyImpaired={isVisuallyImpaired}
              setIsVisuallyImpaired={setIsVisuallyImpaired}
              fieldErrors={fieldErrors}
            />
          ) : (
            <SignupCounselor
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              gender={gender}
              setGender={setGender}
              birthYear={birthYear}
              setBirthYear={setBirthYear}
              birthMonth={birthMonth}
              setBirthMonth={setBirthMonth}
              birthDay={birthDay}
              setBirthDay={setBirthDay}
              hasCertification={hasCertification}
              setHasCertification={setHasCertification}
              fieldErrors={fieldErrors}
            />
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#00775c] hover:underline"
            >
              이미 계정이 있으신가요? 로그인
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#00775c] text-white border-none rounded-3xl py-3 px-10 text-xl font-semibold cursor-pointer ${
                isSubmitting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-[#005e49]'
              }`}
            >
              {isSubmitting ? '처리 중...' : '회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
