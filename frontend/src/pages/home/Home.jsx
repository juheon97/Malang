// src/pages/home/Home.jsx
import React, { useEffect, useRef } from 'react';
import styles from '../../styles/home/Home.module.css';
import HomeMain1 from '../../components/home/HomeMain1';
import HomeMain2 from '../../components/home/HomeMain2';
import HomeMain3 from '../../components/home/HomeMain3';
import HomeMain4 from '../../components/home/HomeMain4';
import HomeMain5 from '../../components/home/HomeMain5';
import { useSignLanguage } from '../../contexts/SignLanguageContext';
import { Link } from 'react-router-dom';

function Home() {
  // 각 섹션에 대한 ref 생성

  const { openSignLanguageModal } = useSignLanguage();
  const featureSectionRefs = useRef([]);

  useEffect(() => {
    // Intersection Observer 설정
    const observerOptions = {
      root: null, // viewport를 root로 사용
      rootMargin: '0px 0px -20% 0px', // 화면 아래쪽 20% 지점에 도달했을 때 트리거
      threshold: 0.4, // 요소의 40%가 보일 때 콜백 실행 (더 많이 보여야 함)
    };

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // 요소가 화면에 들어오면 애니메이션 클래스 추가
        if (entry.isIntersecting) {
          // CSS 모듈에서는 클래스 이름이 해시화되므로, 일반 클래스 이름을 직접 추가
          entry.target.classList.add('animate-section');
        }
      });
    }, observerOptions);

    // 모든 feature 섹션에 대해 observer 설정
    featureSectionRefs.current.forEach(ref => {
      if (ref) sectionObserver.observe(ref);
    });

    // 컴포넌트 언마운트 시 observer 해제
    return () => {
      featureSectionRefs.current.forEach(ref => {
        if (ref) sectionObserver.unobserve(ref);
      });
    };
  }, []);

  // ref 배열에 새 ref 추가하는 함수
  const addToRefs = el => {
    if (el && !featureSectionRefs.current.includes(el)) {
      featureSectionRefs.current.push(el);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <Link to="/sign-language">
        <button className={styles.signLanguageButton}>수어 인식 시작</button>
      </Link>

      <HomeMain1 />

      {/* 음성 번역 섹션 - 애니메이션 적용 */}
      <div
        className={styles.featureSection}
        ref={addToRefs}
        style={{ position: 'relative' }}
      >
        <HomeMain2 />
      </div>

      {/* 수어 인식 섹션 - 애니메이션 적용 */}
      <div className={styles.featureSection} ref={addToRefs}>
        <HomeMain3 />
      </div>

      {/* 상담 전용 채널 섹션 - 애니메이션 적용 */}
      <div className={styles.featureSection} ref={addToRefs}>
        <HomeMain4 />
      </div>

      {/* 소통 채널 지원 섹션 - 애니메이션 적용 */}
      <div className={styles.featureSection} ref={addToRefs}>
        <HomeMain5 />
      </div>
    </div>
  );
}

export default Home;
