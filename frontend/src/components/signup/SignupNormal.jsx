// src/components/signup/SignupNormal.jsx
import React from 'react';

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
    </form>
  );
};

export default SignupNormal;
