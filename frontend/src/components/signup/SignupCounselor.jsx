// src/components/signup/SignupCounselor.jsx
import React from 'react';

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
    <form className="w-full max-w-[800px]">
      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">이름 :</label>
        <input
          type="text"
          className="w-4/5 py-3 px-4 border-[3px] border-gray-300 rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">이메일 :</label>
        <input
          type="email"
          className="w-4/5 py-3 px-4 border-[3px] border-gray-300 rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">비밀번호 :</label>
        <input
          type="password"
          className="w-4/5 py-3 px-4 border-[3px] border-gray-300 rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">성별 :</label>
        <div className="flex gap-5 mt-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="male"
              name="gender"
              className="hidden"
              checked={gender === '남'}
              onChange={() => handleGenderChange('남')}
            />
            <label
              htmlFor="male"
              className="flex items-center cursor-pointer text-xl"
            >
              <span
                className={`inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-400 mr-2 relative
                ${gender === '남' ? 'border-[#00a67d] after:content-[""] after:absolute after:w-[10px] after:h-[10px] after:bg-[#00a67d] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2' : ''}`}
              ></span>
              남
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="female"
              name="gender"
              className="hidden"
              checked={gender === '여'}
              onChange={() => handleGenderChange('여')}
            />
            <label
              htmlFor="female"
              className="flex items-center cursor-pointer text-xl"
            >
              <span
                className={`inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-400 mr-2 relative
                ${gender === '여' ? 'border-[#00a67d] after:content-[""] after:absolute after:w-[10px] after:h-[10px] after:bg-[#00a67d] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2' : ''}`}
              ></span>
              여
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">생년월일 :</label>
        <div className="flex gap-4 items-center">
          <div className="flex items-center">
            <div className="relative w-[120px] mr-2.5">
              <input
                type="text"
                className="w-full text-center py-2.5 px-8 border-[3px] border-gray-300 rounded-3xl text-xl relative"
                value={birthYear}
                readOnly
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col h-[30px] justify-between z-[2]">
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-sm text-black h-[15px] flex items-center justify-center p-0"
                  onClick={() => incrementValue(setBirthYear, birthYear, 2023)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-sm text-black h-[15px] flex items-center justify-center p-0"
                  onClick={() => decrementValue(setBirthYear, birthYear, 1900)}
                >
                  ▼
                </button>
              </div>
            </div>
            <span className="ml-1 text-xl">년</span>
          </div>

          <div className="flex items-center">
            <div className="relative w-[80px] mr-2.5">
              <input
                type="text"
                className="w-full text-center py-2.5 px-8 border-[3px] border-gray-300 rounded-3xl text-xl relative"
                value={birthMonth}
                readOnly
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col h-[30px] justify-between z-[2]">
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-sm text-black h-[15px] flex items-center justify-center p-0"
                  onClick={() => incrementValue(setBirthMonth, birthMonth, 12)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-sm text-black h-[15px] flex items-center justify-center p-0"
                  onClick={() => decrementValue(setBirthMonth, birthMonth, 1)}
                >
                  ▼
                </button>
              </div>
            </div>
            <span className="ml-1 text-xl">월</span>
          </div>

          <div className="flex items-center">
            <div className="relative w-[80px] mr-2.5">
              <input
                type="text"
                className="w-full text-center py-2.5 px-8 border-[3px] border-gray-300 rounded-3xl text-xl relative"
                value={birthDay}
                readOnly
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col h-[30px] justify-between z-[2]">
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-sm text-black h-[15px] flex items-center justify-center p-0"
                  onClick={() => incrementValue(setBirthDay, birthDay, 31)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-sm text-black h-[15px] flex items-center justify-center p-0"
                  onClick={() => decrementValue(setBirthDay, birthDay, 1)}
                >
                  ▼
                </button>
              </div>
            </div>
            <span className="ml-1 text-xl">일</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">
          자격증 여부 :
        </label>
        <div className="flex gap-5 mt-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="cert-yes"
              name="certification"
              className="hidden"
              checked={hasCertification}
              onChange={handleCertificationChange}
            />
            <label
              htmlFor="cert-yes"
              className="flex items-center cursor-pointer text-xl"
            >
              <span
                className={`inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-400 mr-2 relative
                ${hasCertification ? 'border-[#00a67d] after:content-[""] after:absolute after:w-[10px] after:h-[10px] after:bg-[#00a67d] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2' : ''}`}
              ></span>
              예
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="cert-no"
              name="certification"
              className="hidden"
              checked={!hasCertification}
              onChange={handleCertificationChange}
            />
            <label
              htmlFor="cert-no"
              className="flex items-center cursor-pointer text-xl"
            >
              <span
                className={`inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-400 mr-2 relative
                ${!hasCertification ? 'border-[#00a67d] after:content-[""] after:absolute after:w-[10px] after:h-[10px] after:bg-[#00a67d] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2' : ''}`}
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
