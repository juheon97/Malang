// src/components/signup/Signup.jsx
import React, { useState } from 'react';
import SignupNormal from '../../components/signup/SignupNormal';
import SignupCounselor from '../../components/signup/SignupCounselor';
// Signup 컴포넌트에서 사용하는 circle 이미지들
import greenCircle from '../../assets/image/signup/signup_green_circle.svg';
import redCircle from '../../assets/image/signup/signup_red_circle.svg';
import yellowCircle from '../../assets/image/signup/signup_yellow_circle.svg';

const Signup = () => {
  const [userType, setUserType] = useState('일반인 사용자');

  // 공통 상태 (이름, 이메일, 비밀번호 필드용)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 일반인 사용자 상태
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState(true);

  // 상담사 상태
  const [gender, setGender] = useState('남');
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [hasCertification, setHasCertification] = useState(true);

  const handleUserTypeChange = type => {
    // 현재 선택된 타입과 다른 경우에만 상태 초기화
    if (userType !== type) {
      setUserType(type);

      // 타입별 상태 초기화
      if (type === '일반인 사용자') {
        // 일반인 사용자로 변경 시 일반인 상태 초기화
        setIsVisuallyImpaired(true);
      } else {
        // 상담사로 변경 시 상담사 상태 초기화
        setGender('남');
        setBirthYear(1990);
        setBirthMonth(1);
        setBirthDay(1);
        setHasCertification(true);
      }

      // 공통 입력 필드도 초기화
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* 배경 원형 이미지들 - 절대적인 위치(px)로 수정 */}
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

      <div className="max-w-[1200px] m-0 py-10 px-5 flex-grow relative z-10">
        <h1 className="text-[#00775c] text-4xl font-bold mb-5">회원가입</h1>
        <div className="w-full h-px bg-gray-200 mb-8"></div>

        <div className="flex gap-3 mb-8">
          <button
            className={`py-2.5 px-5 rounded-full cursor-pointer outline-none text-xl min-w-[120px] text-center whitespace-nowrap border-[4px] ${
              userType === '일반인 사용자'
                ? 'border-[#92e4d1] text-black shadow-md bg-white'
                : 'border-transparent text-gray-500 bg-white'
            }`}
            onClick={() => handleUserTypeChange('일반인 사용자')}
          >
            일반인 사용자
          </button>
          <button
            className={`py-2.5 px-5 rounded-full cursor-pointer outline-none text-xl min-w-[120px] text-center whitespace-nowrap border-[4px] ${
              userType === '상담사'
                ? 'border-[#92e4d1] text-black shadow-md bg-white'
                : 'border-transparent text-gray-500 bg-white'
            }`}
            onClick={() => handleUserTypeChange('상담사')}
          >
            상담사
          </button>
        </div>

        {userType === '일반인 사용자' ? (
          <SignupNormal
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isVisuallyImpaired={isVisuallyImpaired}
            setIsVisuallyImpaired={setIsVisuallyImpaired}
          />
        ) : (
          <SignupCounselor
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
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
          />
        )}

        <button className="bg-[#00775c] text-white border-none rounded-3xl py-3 px-10 text-xl font-semibold cursor-pointer mt-5 absolute bottom-10 right-10 hover:bg-[#005e49]">
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;
