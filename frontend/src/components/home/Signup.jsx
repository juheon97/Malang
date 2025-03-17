// src/components/home/Signup.jsx
import React, { useState } from 'react';
import '../../styles/Signup.css';

const Signup = () => {
  const [userType, setUserType] = useState('일반인 사용자');
  const [isChecked, setIsChecked] = useState(true);

  const handleUserTypeChange = type => {
    setUserType(type);
  };

  const handleRadioChange = () => {
    setIsChecked(!isChecked);
  };

  const pageStyle = {
    backgroundImage: `
      radial-gradient(circle at 90% 8%, rgba(121, 231, 213, 0.27) 0%, rgba(255, 255, 255, 0) 15%),
      radial-gradient(circle at 84% 10%, rgba(233, 230, 47, 0.14) 0%, rgba(255, 255, 255, 0) 15%),
      radial-gradient(circle at 88% 80%, rgba(234, 143, 235, 0.16) 0%, rgba(255, 255, 255, 0) 20%),
      radial-gradient(circle at 3% 4%, rgba(204, 231, 164, 0.37) 0%, rgba(255, 255, 255, 0) 6%)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="signup-container" style={pageStyle}>
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

        <form className="signup-form">
          <div className="form-group">
            <label>닉네임 :</label>
            <input type="text" className="form-input" />
          </div>

          <div className="form-group">
            <label>이메일 :</label>
            <input type="email" className="form-input" />
          </div>

          <div className="form-group">
            <label>비밀번호 :</label>
            <input type="password" className="form-input" />
          </div>

          <div className="form-group radio-group">
            <label>시각장애 여부 :</label>
            <div className="radio-options">
              <div className="radio-option">
                <input
                  type="radio"
                  id="yes-option"
                  name="visualImpairment"
                  checked={isChecked}
                  onChange={handleRadioChange}
                />
                <label htmlFor="yes-option" className="radio-label">
                  <span
                    className={`custom-radio ${isChecked ? 'checked' : ''}`}
                  ></span>
                  예
                </label>
              </div>

              <div className="radio-option">
                <input
                  type="radio"
                  id="no-option"
                  name="visualImpairment"
                  checked={!isChecked}
                  onChange={handleRadioChange}
                />
                <label htmlFor="no-option" className="radio-label">
                  <span
                    className={`custom-radio ${!isChecked ? 'checked' : ''}`}
                  ></span>
                  아니오
                </label>
              </div>
            </div>
          </div>
        </form>

        <button className="signup-btn">회원가입</button>
      </div>
    </div>
  );
};

export default Signup;
