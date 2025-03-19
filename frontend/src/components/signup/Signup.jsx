// src/components/signup/Signup.jsx
import React, { useState } from 'react';
import SignupNormal from './SignupNormal';
import SignupCounselor from './SignupCounselor';
import '../../styles/signup/Signup.css';
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
    <div className="signup-container">
      {/* 배경 원형 이미지들 */}
      <img
        src={greenCircle}
        alt="Green Circle"
        className="background-circle green-circle"
        id="signup-green-circle"
        style={{
          position: 'absolute',
          top: '-35%',
          right: '-30%',
          zIndex: '-1',
          width: '600px',
          height: '600px',
        }}
      />
      <img
        src={redCircle}
        alt="Red Circle"
        className="background-circle red-circle"
        id="signup-red-circle"
        style={{
          position: 'absolute',
          top: '30%',
          left: '70%',
          zIndex: '-1',
          width: '800px',
          height: '800px',
        }}
      />
      <img
        src={yellowCircle}
        alt="Yellow Circle"
        className="background-circle yellow-circle"
        id="signup-yellow-circle"
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          zIndex: '-1',
        }}
      />

      <div className="signup-content">
        <h1 className="signup-title">회원가입</h1>
        <div className="divider"></div>

        <div className="user-type-selector">
          <button
            className={`user-type-btn ${userType === '일반인 사용자' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('일반인 사용자')}
          >
            일반인 사용자
          </button>
          <button
            className={`user-type-btn ${userType === '상담사' ? 'active' : ''}`}
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

        <button className="signup-btn">회원가입</button>
      </div>
    </div>
  );
};

export default Signup;
