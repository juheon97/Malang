// src/components/home/Signup.jsx
import React, { useState } from 'react';
import '../../styles/Signup.css';

const Signup = () => {
  const [userType, setUserType] = useState('일반인 사용자');
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState(true);
  const [hasCertification, setHasCertification] = useState(true);
  const [gender, setGender] = useState('남');
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  
  const handleUserTypeChange = (type) => {
    setUserType(type);
  };
  
  const handleVisualImpairmentChange = () => {
    setIsVisuallyImpaired(!isVisuallyImpaired);
  };

  const handleCertificationChange = () => {
    setHasCertification(!hasCertification);
  };

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
  };

  const incrementValue = (setter, value, max) => {
    if (value < max) {
      setter(value + 1);
    }
  };

  const decrementValue = (setter, value, min) => {
    if (value > min) {
      setter(value - 1);
    }
  };

  return (
    <div className="signup-container">
      
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
            <label>이름 :</label>
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
          
          {userType === '일반인 사용자' ? (
            <div className="form-group radio-group">
              <label>시각장애 여부 :</label>
              <div className="radio-options">
                <div className="radio-option">
                  <input 
                    type="radio" 
                    id="visual-yes" 
                    name="visualImpairment" 
                    checked={isVisuallyImpaired}
                    onChange={handleVisualImpairmentChange}
                  />
                  <label htmlFor="visual-yes" className="radio-label">
                    <span className={`custom-radio ${isVisuallyImpaired ? 'checked' : ''}`}></span>
                    예
                  </label>
                </div>
                
                <div className="radio-option">
                  <input 
                    type="radio" 
                    id="visual-no" 
                    name="visualImpairment" 
                    checked={!isVisuallyImpaired}
                    onChange={handleVisualImpairmentChange}
                  />
                  <label htmlFor="visual-no" className="radio-label">
                    <span className={`custom-radio ${!isVisuallyImpaired ? 'checked' : ''}`}></span>
                    아니오
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group radio-group">
                <label>성별 :</label>
                <div className="radio-options">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="male" 
                      name="gender" 
                      checked={gender === '남'}
                      onChange={() => handleGenderChange('남')}
                    />
                    <label htmlFor="male" className="radio-label">
                      <span className={`custom-radio ${gender === '남' ? 'checked' : ''}`}></span>
                      남
                    </label>
                  </div>
                  
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="female" 
                      name="gender" 
                      checked={gender === '여'}
                      onChange={() => handleGenderChange('여')}
                    />
                    <label htmlFor="female" className="radio-label">
                      <span className={`custom-radio ${gender === '여' ? 'checked' : ''}`}></span>
                      여
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>생년월일 :</label>
                <div className="date-selector">
                  <div className="date-input-container">
                    <div className="date-input-group">
                      <input 
                        type="text" 
                        className="date-input" 
                        value={birthYear} 
                        readOnly 
                      />
                      <div className="date-controls">
                        <button 
                          type="button" 
                          className="date-control-btn"
                          onClick={() => incrementValue(setBirthYear, birthYear, 2023)}
                        >
                          ▲
                        </button>
                        <button 
                          type="button" 
                          className="date-control-btn"
                          onClick={() => decrementValue(setBirthYear, birthYear, 1900)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span className="date-label">년</span>
                  </div>
                  
                  <div className="date-input-container">
                    <div className="date-input-group">
                      <input 
                        type="text" 
                        className="date-input" 
                        value={birthMonth} 
                        readOnly 
                      />
                      <div className="date-controls">
                        <button 
                          type="button" 
                          className="date-control-btn"
                          onClick={() => incrementValue(setBirthMonth, birthMonth, 12)}
                        >
                          ▲
                        </button>
                        <button 
                          type="button" 
                          className="date-control-btn"
                          onClick={() => decrementValue(setBirthMonth, birthMonth, 1)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span className="date-label">월</span>
                  </div>
                  
                  <div className="date-input-container">
                    <div className="date-input-group">
                      <input 
                        type="text" 
                        className="date-input" 
                        value={birthDay} 
                        readOnly 
                      />
                      <div className="date-controls">
                        <button 
                          type="button" 
                          className="date-control-btn"
                          onClick={() => incrementValue(setBirthDay, birthDay, 31)}
                        >
                          ▲
                        </button>
                        <button 
                          type="button" 
                          className="date-control-btn"
                          onClick={() => decrementValue(setBirthDay, birthDay, 1)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span className="date-label">일</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group radio-group">
                <label>자격증 여부 :</label>
                <div className="radio-options">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="cert-yes" 
                      name="certification" 
                      checked={hasCertification}
                      onChange={handleCertificationChange}
                    />
                    <label htmlFor="cert-yes" className="radio-label">
                      <span className={`custom-radio ${hasCertification ? 'checked' : ''}`}></span>
                      예
                    </label>
                  </div>
                  
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="cert-no" 
                      name="certification" 
                      checked={!hasCertification}
                      onChange={handleCertificationChange}
                    />
                    <label htmlFor="cert-no" className="radio-label">
                      <span className={`custom-radio ${!hasCertification ? 'checked' : ''}`}></span>
                      아니오
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </form>
        
        <button className="signup-btn">회원가입</button>
      </div>
    </div>
  );
};

export default Signup;