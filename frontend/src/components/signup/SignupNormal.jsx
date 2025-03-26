import React from 'react';

const SignupNormal = ({
  nickname,
  setNickname,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isVisuallyImpaired,
  setIsVisuallyImpaired,
  fieldErrors = {},
}) => {
  const handleVisualImpairmentChange = () => {
    setIsVisuallyImpaired(!isVisuallyImpaired);
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">닉네임 :</label>
        <input
          type="text"
          className={`w-4/5 py-3 px-4 border-[3px] ${
            fieldErrors.nickname ? 'border-red-500' : 'border-gray-300'
          } rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]`}
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        {fieldErrors.nickname && (
          <span className="text-red-500 text-sm mt-1">
            {fieldErrors.nickname}
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">이메일 :</label>
        <input
          type="email"
          className={`w-4/5 py-3 px-4 border-[3px] ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-300'
          } rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]`}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {fieldErrors.email && (
          <span className="text-red-500 text-sm mt-1">{fieldErrors.email}</span>
        )}
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">비밀번호 :</label>
        <input
          type="password"
          className={`w-4/5 py-3 px-4 border-[3px] ${
            fieldErrors.password ? 'border-red-500' : 'border-gray-300'
          } rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]`}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {fieldErrors.password && (
          <span className="text-red-500 text-sm mt-1">
            {fieldErrors.password}
          </span>
        )}
        <p className="text-gray-500 text-sm mt-2">
          비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자를 포함해야
          합니다.
        </p>
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">
          비밀번호 확인 :
        </label>
        <input
          type="password"
          className={`w-4/5 py-3 px-4 border-[3px] ${
            fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          } rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]`}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        {fieldErrors.confirmPassword && (
          <span className="text-red-500 text-sm mt-1">
            {fieldErrors.confirmPassword}
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">
          시각장애 여부 :
        </label>
        <div className="flex gap-5 mt-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="visual-yes"
              name="visualImpairment"
              className="hidden"
              checked={isVisuallyImpaired}
              onChange={handleVisualImpairmentChange}
            />
            <label
              htmlFor="visual-yes"
              className="flex items-center cursor-pointer text-xl"
            >
              <span
                className={`inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-400 mr-2 relative
                ${isVisuallyImpaired ? 'border-[#00a67d] after:content-[""] after:absolute after:w-[10px] after:h-[10px] after:bg-[#00a67d] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2' : ''}`}
              ></span>
              예
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="visual-no"
              name="visualImpairment"
              className="hidden"
              checked={!isVisuallyImpaired}
              onChange={handleVisualImpairmentChange}
            />
            <label
              htmlFor="visual-no"
              className="flex items-center cursor-pointer text-xl"
            >
              <span
                className={`inline-block w-[18px] h-[18px] rounded-full border-2 border-gray-400 mr-2 relative
                ${!isVisuallyImpaired ? 'border-[#00a67d] after:content-[""] after:absolute after:w-[10px] after:h-[10px] after:bg-[#00a67d] after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2' : ''}`}
              ></span>
              아니오
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 text-sm">
          * 시각장애 여부를 '예'로 선택하시면 화면 읽기 기능이 향상된 서비스를
          이용하실 수 있습니다.
        </p>
      </div>
    </>
  );
};

export default SignupNormal;
