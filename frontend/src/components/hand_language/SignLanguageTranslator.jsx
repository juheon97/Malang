import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import KNN from 'ml-knn';
import { join_jamos } from '../../utils/hangulUtils';

const gestureMap = {
  0: 'ㄱ',
  1: 'ㄴ',
  2: 'ㄷ',
  3: 'ㄹ',
  4: 'ㅁ',
  5: 'ㅂ',
  6: 'ㅅ',
  7: 'ㅇ',
  8: 'ㅈ',
  9: 'ㅎ',
  10: 'ㅏ',
  11: 'ㅓ',
  12: 'ㅕ',
  13: 'ㅗ',
  14: 'ㅜ',
  15: 'ㅡ',
  16: 'ㅣ',
  17: 'ㅐ',
  18: 'ㅔ',
  19: ' ',
  20: 'delete',
  21: 'next',
};

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

const SignLanguageTranslator = ({
  videoRef: externalVideoRef,
  onTranslationResult,
}) => {
  const internalVideoRef = useRef(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const processingRef = useRef(false);
  const frameIntervalRef = useRef(null);
  const lastGestureTimeRef = useRef({});
  const [completedSentences, setCompletedSentences] = useState([]);
  const lastProcessedGestureTimeRef = useRef(0);
  const currentGestureRef = useRef({ idx: null, count: 0 });

  // 상태 변수들을 먼저 선언
  const [sentence, setSentence] = useState('');
  const [mergeJamo, setMergeJamo] = useState('');
  const [lastConsonant, setLastConsonant] = useState(null);
  const [lastConsonantTime, setLastConsonantTime] = useState(0);
  const [knn, setKnn] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const doubleConsonantThreshold = 5000; // 3초
  const holdTime = 5000; // 3초

  const calculateAngles = landmarks => {
    try {
      // 관절 인덱스 정의
      const v1Indices = [
        0, 1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 0, 17, 18, 19,
      ];
      const v2Indices = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ];
      const angleIndices = [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18];

      // 벡터 계산
      const vectors = [];
      for (let i = 0; i < v1Indices.length; i++) {
        const v1 = landmarks[v1Indices[i]];
        const v2 = landmarks[v2Indices[i]];

        vectors.push({
          x: v2.x - v1.x,
          y: v2.y - v1.y,
          z: v2.z - v1.z,
        });
      }

      // 벡터 정규화
      const normalizedVectors = vectors.map(v => {
        const magnitude = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return {
          x: v.x / magnitude,
          y: v.y / magnitude,
          z: v.z / magnitude,
        };
      });

      // 각도 계산
      const angles = [];
      for (let i = 0; i < angleIndices.length; i++) {
        const idx1 = angleIndices[i];
        const idx2 = idx1 + 1;

        const v1 = normalizedVectors[idx1];
        const v2 = normalizedVectors[idx2];

        // 내적 계산
        const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

        // 아크코사인으로 각도 계산 (라디안)
        const angle = Math.acos(Math.min(Math.max(dotProduct, -1.0), 1.0));

        // 라디안에서 각도로 변환
        angles.push(angle * (180.0 / Math.PI));
      }
      console.log('계산된 원시 각도:', angles);
      return angles;
    } catch (error) {
      console.error('각도 계산 오류:', error);
      // 기본 각도 배열 반환 (모든 각도 0)
      return Array(15).fill(0);
    }
  };

  const handleVowelsAndControls = useCallback(
    idx => {
      switch (idx) {
        case 19:
          setSentence(prev => prev + ' ');
          break;
        case 20:
          console.log('초기화 제스처 인식됨: 모든 텍스트 지움');

          setSentence(prevSentence => {
            console.log('이전 sentence:', prevSentence);
            return '';
          });

          setMergeJamo(prevMergeJamo => {
            console.log('이전 mergeJamo:', prevMergeJamo);
            return '';
          });

          setLastConsonant(null);
          setLastConsonantTime(0);

          // 완성된 문장들도 초기화
          setCompletedSentences(prevCompletedSentences => {
            console.log('이전 completedSentences:', prevCompletedSentences);
            return [];
          });

          // 상태 업데이트 후 확인 (setTimeout 대신 콜백 사용)
          console.log('초기화 명령 실행 완료');

          // 실제 DOM 업데이트 확인을 위한 타이머 (필요시 유지)
          setTimeout(() => {
            console.log('DOM 업데이트 후 상태:', {
              sentence,
              mergeJamo,
              completedSentences,
            });
          }, 100);
          break;

        case 21: // next 제스처가 인식되었을 때
          const currentTime = Date.now();
          if (currentTime - lastNextGestureTimeRef.current > 5000) {
            console.log("'next' 제스처 인식됨 - 메시지 전송");

            const newSentence = sentence + join_jamos(mergeJamo);

            // onTranslationResult 콜백이 있으면 호출 (setSentence 밖으로 이동)
            if (onTranslationResult && newSentence.trim()) {
              onTranslationResult(newSentence);
            }

            setSentence('');
            setMergeJamo('');
            lastNextGestureTimeRef.current = currentTime;
          }
          break;

        default:
          setMergeJamo(prev => prev + gestureMap[idx]);
      }
    },
    [mergeJamo, sentence, completedSentences],
  );

  const handleDoubleConsonant = useCallback(
    (idx, currentTime) => {
      const doubleConsonants = { 0: 'ㄲ', 2: 'ㄸ', 5: 'ㅃ', 6: 'ㅆ', 8: 'ㅉ' };
      if (idx in doubleConsonants) {
        if (
          lastConsonant === idx &&
          currentTime - lastConsonantTime < doubleConsonantThreshold
        ) {
          setMergeJamo(prev => prev.slice(0, -1) + doubleConsonants[idx]);
          setLastConsonant(null);
          setLastConsonantTime(0);
        } else {
          setMergeJamo(prev => prev + gestureMap[idx]);
          setLastConsonant(idx);
          setLastConsonantTime(currentTime);
        }
      }
    },
    [lastConsonant, lastConsonantTime, doubleConsonantThreshold],
  );
  // 마지막 next 제스처 시간을 저장할 ref 추가
  const lastNextGestureTimeRef = useRef(0);

  const handleGesture = useCallback(
    idx => {
      const currentTime = Date.now();
      console.log(
        '제스처 처리:',
        idx,
        gestureMap[idx],
        '마지막 자음 시간으로부터 경과:',
        currentTime - lastConsonantTime,
      );

      // 1. 전체 제스처 인식에 대한 디바운싱
      // 마지막 처리된 제스처로부터 500ms 이내면 무시 (clear 제외)
      if (
        idx !== 20 &&
        currentTime - lastProcessedGestureTimeRef.current < 1000
      ) {
        console.log('전체 제스처 디바운싱: 너무 빠른 제스처 변경 무시');
        return;
      }

      // 2. 같은 제스처 반복에 대한 디바운싱 (기존 로직)
      if (idx !== 20) {
        const lastTimeForGesture = lastGestureTimeRef.current[idx] || 0;
        if (currentTime - lastTimeForGesture < 2000) {
          console.log('너무 빠른 제스처 반복 무시:', idx, gestureMap[idx]);
          return;
        }
      }

      // 3. 연속 인식 요구 로직
      if (currentGestureRef.current.idx === idx) {
        currentGestureRef.current.count++;
      } else {
        currentGestureRef.current.idx = idx;
        currentGestureRef.current.count = 1;
      }

      // 같은 제스처가 최소 3번 연속으로 인식되어야 처리 (clear 제외)
      if (idx !== 20 && currentGestureRef.current.count < 3) {
        console.log(
          '연속 인식 카운트:',
          currentGestureRef.current.count,
          '/',
          3,
          '- 더 많은 인식 필요',
        );
        return;
      }

      // 현재 제스처 시간 저장
      lastGestureTimeRef.current[idx] = currentTime;
      lastProcessedGestureTimeRef.current = currentTime;

      // 제스처 처리 로직 (기존과 동일)
      if (gestureMap[idx] && currentTime - lastConsonantTime > holdTime) {
        if ([0, 2, 5, 6, 8].includes(idx)) {
          // 된소리 가능한 자음
          handleDoubleConsonant(idx, currentTime);
        } else {
          // 모음이나 다른 제스처
          handleVowelsAndControls(idx);
        }

        // 제스처 처리 후 카운트 초기화
        currentGestureRef.current.count = 0;
      }
    },
    [
      lastConsonantTime,
      holdTime,
      handleDoubleConsonant,
      handleVowelsAndControls,
    ],
  );

  const processFrame = useCallback(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !handLandmarkerRef.current ||
      !knn
    ) {
      console.log('Missing required refs:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        handLandmarker: !!handLandmarkerRef.current,
        knn: !!knn,
      });
      return;
    }

    // 비디오 요소 상태 확인 추가
    console.log('비디오 요소 상태:', {
      videoWidth: videoRef.current.videoWidth,
      videoHeight: videoRef.current.videoHeight,
      readyState: videoRef.current.readyState,
      paused: videoRef.current.paused,
      ended: videoRef.current.ended,
    });

    if (!isVideoReady) return;

    console.log(
      'Processing frame with video dimensions:',
      videoRef.current.videoWidth,
      videoRef.current.videoHeight,
    );

    processingRef.current = true;

    try {
      // 캔버스 컨텍스트 및 크기 설정
      if (!ctxRef.current) {
        ctxRef.current = canvasRef.current.getContext('2d');
      }

      // 비디오 크기가 유효한지 확인
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      if (videoWidth <= 0 || videoHeight <= 0) {
        processingRef.current = false;
        return;
      }

      // 캔버스 크기 설정 (한 번만)
      if (
        canvasRef.current.width !== videoWidth ||
        canvasRef.current.height !== videoHeight
      ) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }

      // 비디오 프레임 그리기
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      ctxRef.current.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      // 손 감지 (동기 방식으로 변경)
      const results = handLandmarkerRef.current.detectForVideo(
        videoRef.current,
        Date.now(),
        {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        },
      );

      if (results.landmarks && results.landmarks.length > 0) {
        console.log('손 감지됨:', results.landmarks.length);
        console.log('랜드마크 데이터:', results.landmarks[0]);
        for (const landmarks of results.landmarks) {
          const angles = calculateAngles(landmarks);

          try {
            const prediction = knn.predict([angles]);
            console.log(
              '인식된 제스처:',
              prediction[0],
              '=>',
              gestureMap[prediction[0]],
            );
            handleGesture(prediction[0]);
          } catch (error) {
            console.error('KNN prediction error:', error);
          }

          // 랜드마크 그리기
          drawConnectors(ctxRef.current, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2,
          });
          drawLandmarks(ctxRef.current, landmarks, {
            color: '#FF0000',
            lineWidth: 1,
          });
        }
      } else {
        console.log('손이 감지되지 않음');
      }

      processingRef.current = false;
    } catch (error) {
      console.error('Processing error:', error);
      processingRef.current = false;
    }
  }, [knn, calculateAngles, handleGesture, isVideoReady]);

  // 비디오 로드 완료 처리
  const handleVideoLoaded = useCallback(() => {
    if (
      videoRef.current &&
      videoRef.current.videoWidth > 0 &&
      videoRef.current.videoHeight > 0
    ) {
      console.log(
        '비디오 준비 완료:',
        videoRef.current.videoWidth,
        videoRef.current.videoHeight,
      );
      setIsVideoReady(true);
    } else {
      console.log(
        '비디오 준비 안됨:',
        videoRef.current?.videoWidth,
        videoRef.current?.videoHeight,
      );
    }
  }, []);

  useEffect(() => {
    if (sentence === '' && mergeJamo === '') {
      console.log('텍스트가 모두 지워짐');
      // 필요한 경우 추가 작업 수행
    }
  }, [sentence, mergeJamo]);

  // 프레임 처리 인터벌 설정
  useEffect(() => {
    if (isVideoReady && handLandmarkerRef.current && knn) {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }

      // 100ms 간격으로 프레임 처리 (초당 10프레임)
      frameIntervalRef.current = setInterval(processFrame, 50);

      return () => {
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
        }
      };
    }
  }, [isVideoReady, knn, processFrame]);

  // MediaPipe 및 웹캠 초기화
  useEffect(() => {
    let isMounted = true;

    const initializeMediaPipe = async () => {
      try {
        console.log('MediaPipe 초기화 시작');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );

        if (!isMounted) return;
        console.log('MediaPipe Vision 모듈 로드 완료');

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU', // GPU 사용
          },
          numHands: 1,
          runningMode: 'VIDEO',
        });

        if (!isMounted) return;
        console.log('HandLandmarker 초기화 완료');
        handLandmarkerRef.current = handLandmarker;

        // CSV 파일 로드 및 KNN 모델 초기화
        try {
          console.log('KNN 모델 초기화 시작');
          const response = await fetch('/data/gesture_train.csv');
          if (!response.ok) {
            throw new Error(`CSV 파일 로드 실패: ${response.status}`);
          }

          const csvData = await response.text();
          console.log('CSV 데이터 로드됨:', csvData.slice(0, 100) + '...');

          const rows = csvData.split('\n').filter(row => row.trim());
          console.log(`총 ${rows.length}개의 행 발견`);

          if (rows.length <= 1) {
            throw new Error('CSV 파일이 비어있거나 헤더만 있습니다');
          }

          const dataRows = rows.slice(1); // 헤더 제외
          const angles = [];
          const labels = [];

          dataRows.forEach(row => {
            const values = row.split(',').map(Number);
            if (values.length > 1 && !values.some(isNaN)) {
              angles.push(values.slice(0, -1));
              labels.push(values[values.length - 1]);
            } else {
              console.warn('유효하지 않은 데이터 행:', row);
            }
          });

          if (angles.length === 0) {
            throw new Error('CSV에서 유효한 데이터를 찾을 수 없습니다');
          }

          if (!isMounted) return;
          console.log(`${angles.length}개의 학습 예제 로드됨`);
          console.log('첫 번째 학습 데이터:', angles[0], '=>', labels[0]);

          const knnModel = new KNN(angles, labels, { k: 3 });
          setKnn(knnModel);
          console.log('KNN 모델 초기화 완료');

          // 웹캠 설정
          const constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
          };

          console.log('웹캠 접근 시도');
          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', handleVideoLoaded);
            console.log('비디오 스트림 설정 완료');
          }
        } catch (error) {
          console.error('CSV 로드 또는 KNN 초기화 오류:', error);
        }
      } catch (error) {
        console.error('MediaPipe 초기화 오류:', error);
      }
    };

    initializeMediaPipe();

    // 정리 함수
    return () => {
      isMounted = false;

      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }

      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', handleVideoLoaded);

        if (videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [handleVideoLoaded]);

  return (
    <div
      className="translator-container"
      style={{ position: 'relative', width: '640px', height: '480px' }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <div
        className="text-overlay"
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '20px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white',
        }}
      >
        <div
          className="sentence"
          style={{ fontSize: '18px', fontWeight: 'bold' }}
        >
          {sentence}
        </div>
        <div className="jamo" style={{ fontSize: '16px', color: '#ffcc00' }}>
          {mergeJamo}
        </div>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;
