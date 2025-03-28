import React, { useState } from 'react';

const SignupCounselor = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
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
  fieldErrors = {},
}) => {
  const handleGenderChange = selectedGender => {
    setGender(selectedGender);
  };

  const handleCertificationChange = () => {
    setHasCertification(!hasCertification);
  };

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const yearList = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const monthList = Array.from({ length: 12 }, (_, i) => i + 1);

  const getMaxDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const maxDays = getMaxDaysInMonth(birthYear, birthMonth);

  const dayList = Array.from({ length: maxDays }, (_, i) => i + 1);

  // 드롭다운 토글 함수
  const toggleDropdown = (setter, currentState) => {
    setYearDropdownOpen(false);
    setMonthDropdownOpen(false);
    setDayDropdownOpen(false);

    setter(!currentState);
  };

  // 드롭다운 항목 선택 함수
  const selectItem = (value, setter, dropdownSetter) => {
    setter(value);
    dropdownSetter(false);
  };

  // 날짜가 유효한지 확인하고 필요시 조정
  React.useEffect(() => {
    if (birthDay > maxDays) {
      setBirthDay(maxDays);
    }
  }, [birthMonth, birthYear, birthDay, maxDays, setBirthDay]);

  // 다른 곳 클릭시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setYearDropdownOpen(false);
      setMonthDropdownOpen(false);
      setDayDropdownOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="mb-6 flex flex-col items-start">
        <label className="w-full text-xl text-gray-800 mb-2">이름 :</label>
        <input
          type="text"
          className={`w-4/5 py-3 px-4 border-[3px] ${
            fieldErrors.name ? 'border-red-500' : 'border-gray-300'
          } rounded-3xl outline-none text-xl focus:border-[#00a67d] focus:shadow-[0_0_5px_rgba(0,166,125,0.2)]`}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {fieldErrors.name && (
          <span className="text-red-500 text-sm mt-1">{fieldErrors.name}</span>
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
          {/* 년도 드롭다운 */}
          <div className="relative">
            <div
              className="flex items-center justify-between w-32 py-2 px-3 border-2 border-gray-300 rounded-lg bg-white cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                toggleDropdown(setYearDropdownOpen, yearDropdownOpen);
              }}
            >
              <span className="text-gray-700">{birthYear || 'YYYY'}</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${yearDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            {yearDropdownOpen && (
              <div
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {yearList.map(year => (
                  <div
                    key={year}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${birthYear === year ? 'bg-gray-100 text-[#00a67d]' : ''}`}
                    onClick={() =>
                      selectItem(year, setBirthYear, setYearDropdownOpen)
                    }
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
            <span className="ml-2">년</span>
          </div>

          {/* 월 드롭다운 */}
          <div className="relative">
            <div
              className="flex items-center justify-between w-24 py-2 px-3 border-2 border-gray-300 rounded-lg bg-white cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                toggleDropdown(setMonthDropdownOpen, monthDropdownOpen);
              }}
            >
              <span className="text-gray-700">{birthMonth || 'MM'}</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${monthDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            {monthDropdownOpen && (
              <div
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {monthList.map(month => (
                  <div
                    key={month}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${birthMonth === month ? 'bg-gray-100 text-[#00a67d]' : ''}`}
                    onClick={() =>
                      selectItem(month, setBirthMonth, setMonthDropdownOpen)
                    }
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
            <span className="ml-2">월</span>
          </div>

          {/* 일 드롭다운 */}
          <div className="relative">
            <div
              className="flex items-center justify-between w-24 py-2 px-3 border-2 border-gray-300 rounded-lg bg-white cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                toggleDropdown(setDayDropdownOpen, dayDropdownOpen);
              }}
            >
              <span className="text-gray-700">{birthDay || 'DD'}</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${dayDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            {dayDropdownOpen && (
              <div
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {dayList.map(day => (
                  <div
                    key={day}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${birthDay === day ? 'bg-gray-100 text-[#00a67d]' : ''}`}
                    onClick={() =>
                      selectItem(day, setBirthDay, setDayDropdownOpen)
                    }
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}
            <span className="ml-2">일</span>
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
    </>
  );
};

export default SignupCounselor;
