// src/utils/hangulUtils.js
export function join_jamos(jamos) {
  const CHOSEONG = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ];

  const JUNGSEONG = [
    'ㅏ',
    'ㅐ',
    'ㅑ',
    'ㅒ',
    'ㅓ',
    'ㅔ',
    'ㅕ',
    'ㅖ',
    'ㅗ',
    'ㅘ',
    'ㅙ',
    'ㅚ',
    'ㅛ',
    'ㅜ',
    'ㅝ',
    'ㅞ',
    'ㅟ',
    'ㅠ',
    'ㅡ',
    'ㅢ',
    'ㅣ',
  ];

  const JONGSEONG = [
    '',
    'ㄱ',
    'ㄲ',
    'ㄳ',
    'ㄴ',
    'ㄵ',
    'ㄶ',
    'ㄷ',
    'ㄹ',
    'ㄺ',
    'ㄻ',
    'ㄼ',
    'ㄽ',
    'ㄾ',
    'ㄿ',
    'ㅀ',
    'ㅁ',
    'ㅂ',
    'ㅄ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ];

  let result = '';
  let cho, jung, jong;
  let i = 0;

  while (i < jamos.length) {
    // 초성
    cho = CHOSEONG.indexOf(jamos[i]);
    if (cho === -1) {
      result += jamos[i];
      i++;
      continue;
    }
    i++;

    // 중성
    jung = i < jamos.length ? JUNGSEONG.indexOf(jamos[i]) : -1;
    if (jung === -1) {
      result += CHOSEONG[cho];
      continue;
    }
    i++;

    // 종성
    jong = i < jamos.length ? JONGSEONG.indexOf(jamos[i]) : -1;
    if (jong === -1) {
      jong = 0; // 종성 없음
    } else {
      i++;
    }

    // 유니코드 한글 = 0xAC00 + (초성 * 21 + 중성) * 28 + 종성
    const hanChar = String.fromCharCode(0xac00 + (cho * 21 + jung) * 28 + jong);
    result += hanChar;
  }

  return result;
}
