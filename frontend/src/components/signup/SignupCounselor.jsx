// src/components/signup/SignupCounselor.jsx
import React from 'react';
import '../../styles/signup/SignupForms.css';

const SignupCounselor = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  gender,
  setGender,
  birthYear,
  setBirthYear,
  birthMonth,
  setBirthMonth,
  birthDay,
  setBirthDay,
  hasCertification,
  setHasCertification,
}) => {
  const handleGenderChange = selectedGender => {
    setGender(selectedGender);
  };

  const handleCertificationChange = () => {
    setHasCertification(!hasCertification);
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
    <form className="signup-form">
      <div className="form-group">
        <label>이름 :</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>이메일 :</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>비밀번호 :</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

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
              <span
                className={`custom-radio ${gender === '남' ? 'checked' : ''}`}
              ></span>
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
              <span
                className={`custom-radio ${gender === '여' ? 'checked' : ''}`}
              ></span>
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
              <span
                className={`custom-radio ${hasCertification ? 'checked' : ''}`}
              ></span>
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
              <span
                className={`custom-radio ${!hasCertification ? 'checked' : ''}`}
              ></span>
              아니오
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SignupCounselor;
