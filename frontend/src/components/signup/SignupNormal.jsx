// src/components/signup/SignupNormal.jsx
import React from 'react';
import '../../styles/signup/SignupForms.css';

const SignupNormal = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  isVisuallyImpaired,
  setIsVisuallyImpaired,
}) => {
  const handleVisualImpairmentChange = () => {
    setIsVisuallyImpaired(!isVisuallyImpaired);
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
              <span
                className={`custom-radio ${isVisuallyImpaired ? 'checked' : ''}`}
              ></span>
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
              <span
                className={`custom-radio ${!isVisuallyImpaired ? 'checked' : ''}`}
              ></span>
              아니오
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SignupNormal;
