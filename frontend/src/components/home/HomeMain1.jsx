import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // AuthContext 불러오기
import styles from '../../styles/home/Home1.module.css';
// 폰트 CSS 파일 import
import '../../styles/fonts.css';
// SVG 로고 import
import MalangLogo from '../../assets/image/Malang_logo.svg';
// 메인 대화 이미지 import
import MainDialogue from '../../assets/image/homemain1/Main1_dialogue.png';
// 원형 이미지 import
import MainGreenCircle1 from '../../assets/image/homemain1/Main1_green_circle1.svg';
import MainGreenCircle2 from '../../assets/image/homemain1/Main1_green_circle2.svg';
import MainYellowCircle from '../../assets/image/homemain1/Main1_yellow_circle.svg';
// 점 이미지 import
import MainDot1 from '../../assets/image/homemain1/Main1_dot1.svg';
import MainDot2 from '../../assets/image/homemain1/Main1_dot2.svg';

const HomeMain1 = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth(); // 로딩 상태도 함께 가져오기

  return (
    <div
      className={styles.heroSection}
      style={{
        paddingTop: '80px',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* 원형 이미지 추가 - navbar와 겹치지 않도록 위치 조정 */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          zIndex: '0',
        }}
      >
        <img
          src={MainGreenCircle1}
          alt="녹색 원"
          className={`${styles.shapeAnimation} ${styles.greenCircle}`}
          style={{
            position: 'absolute',
            top: '0px',
            left: '-80px',
            width: '350px',
            height: '350px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
            zIndex: '0',
          }}
        />
        <img
          src={MainYellowCircle}
          alt="노란색 원"
          className={`${styles.shapeAnimation} ${styles.yellowCircle}`}
          style={{
            position: 'absolute',
            top: '-50px',
            left: '70px',
            width: '300px',
            height: '300px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
            zIndex: '0',
          }}
        />
        <img
          src={MainDot1}
          alt="점 이미지"
          className={`${styles.shapeAnimation} ${styles.dotAnimation}`}
          style={{
            position: 'absolute',
            top: '110px',
            left: '360px',
            width: '40px',
            height: '40px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
            zIndex: '0',
          }}
        />
        <img
          src={MainDot2}
          alt="점 이미지2"
          className={`${styles.shapeAnimation} ${styles.dotAnimationDelayed}`}
          style={{
            position: 'absolute',
            top: '350px',
            left: '-120px',
            width: '20px',
            height: '20px',
            pointerEvents: 'none',
            objectFit: 'contain',
            maxWidth: 'none',
            zIndex: '0',
          }}
        />
      </div>
      <div
        className={styles.heroContent}
        style={{ position: 'relative', zIndex: '2' }}
      >
        <div
          className={styles.logoArea}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <img
            src={MalangLogo}
            alt="말랑 로고"
            className={styles.heroLogo}
            style={{ position: 'relative', top: '3px', marginRight: '8px' }}
          />
          <h1 className={styles.heroTitle} style={{ color: 'black' }}>
            말랑
          </h1>
        </div>
        <h2 className={styles.heroSubtitle}>Malang</h2>
        <p className={styles.heroDesc}>누구든 쉽게 소통할 수 있는</p>
        <p className={styles.heroFeatures}>
          음성 입력 / 음성 번역 / 음성 출력 / 음성 STT
          <br />
          음성 인식 / 실시간 대화 / 실시간 자막 / STT TTS 번역으로
          <br />
          점자 기기 / 보조기 호환 음성 / 필담으로 간단하게 소통 가능
        </p>

        {/* 로그인 상태에 따라 버튼 표시 여부 결정 */}
        {/* 로딩 중에는 버튼을 숨기고, 로딩 완료 후 로그인 상태에 따라 표시 */}
        <div
          className={styles.heroButtons}
          style={{
            visibility: isLoading
              ? 'hidden'
              : !currentUser
                ? 'visible'
                : 'hidden',
            // 높이를 유지하면서 투명하게 처리
            height: isLoading || !!currentUser ? '48px' : 'auto',
          }}
        >
          {!isLoading && !currentUser && (
            <>
              <button
                className={styles.homeSignupBtn}
                onClick={() => navigate('/Signup')}
              >
                회원가입
              </button>
              <button
                className={styles.loginBtn}
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
      {/* 녹색 원 이미지를 hero-section에 절대 위치로 배치 및 애니메이션 추가 */}
      <img
        src={MainGreenCircle2}
        alt="녹색 원3"
        className={`${styles.shapeAnimation} ${styles.greenCircleLarge}`}
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          top: '-30px',
          right: '-140px',
          pointerEvents: 'none',
          zIndex: '0',
          opacity: 0,
        }}
      />

      <div
        className={styles.heroImage}
        style={{ position: 'relative', zIndex: '2' }}
      >
        <img
          src={MainDialogue}
          alt="대화 이미지"
          className={styles.mainDialogueImg}
          style={{
            pointerEvents: 'none',
            position: 'relative',
            zIndex: '2',
          }}
        />
      </div>
    </div>
  );
};

export default HomeMain1;
