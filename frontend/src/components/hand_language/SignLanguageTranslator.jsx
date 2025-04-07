import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
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
  20: '',
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

const SignLanguageTranslator = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const processingRef = useRef(false);
  const frameIntervalRef = useRef(null);

  const [sentence, setSentence] = useState('');
  const [mergeJamo, setMergeJamo] = useState('');
  const [lastConsonant, setLastConsonant] = useState(null);
  const [lastConsonantTime, setLastConsonantTime] = useState(0);
  const [knn, setKnn] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const doubleConsonantThreshold = 3000; // 3초
  const holdTime = 3000; // 3초

  const calculateAngles = useCallback(landmarks => {
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

    return angles;
  }, []);

  const handleVowelsAndControls = useCallback(
    idx => {
      switch (idx) {
        case 19:
          setSentence(prev => prev + ' ');
          break;
        case 20:
          setSentence('');
          setMergeJamo('');
          break;
        case 21:
          setSentence(prev => prev + join_jamos(mergeJamo));
          setMergeJamo('');
          break;
        default:
          setMergeJamo(prev => prev + gestureMap[idx]);
      }
    },
    [mergeJamo],
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

  const handleGesture = useCallback(
    idx => {
      const currentTime = Date.now();
      if (gestureMap[idx] && currentTime - lastConsonantTime > holdTime) {
        if ([0, 2, 5, 6, 8].includes(idx)) {
          // 된소리 가능한 자음
          handleDoubleConsonant(idx, currentTime);
        } else {
          // 모음이나 다른 제스처
          handleVowelsAndControls(idx);
        }
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
    if (processingRef.current) return;
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !handLandmarkerRef.current ||
      !knn
    )
      return;
    if (!isVideoReady) return;

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
        { width: videoWidth, height: videoHeight },
      );

      if (results.landmarks && results.landmarks.length > 0) {
        for (const landmarks of results.landmarks) {
          const angles = calculateAngles(landmarks);

          try {
            const prediction = knn.predict([angles]);
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
      setIsVideoReady(true);
    }
  }, []);

  // 프레임 처리 인터벌 설정
  useEffect(() => {
    if (isVideoReady && handLandmarkerRef.current && knn) {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }

      // 100ms 간격으로 프레임 처리 (초당 10프레임)
      frameIntervalRef.current = setInterval(processFrame, 16);

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
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );

        if (!isMounted) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU', // GPU 대신 CPU 사용
          },
          numHands: 1,
          runningMode: 'VIDEO',
        });

        if (!isMounted) return;
        handLandmarkerRef.current = handLandmarker;

        // CSV 파일 로드 및 KNN 모델 초기화
        try {
          const response = await fetch('data/gesture_train.csv');
          if (!response.ok) {
            throw new Error(`Failed to load CSV: ${response.status}`);
          }

          const csvData = await response.text();
          const rows = csvData.split('\n').filter(row => row.trim());

          if (rows.length <= 1) {
            throw new Error('CSV file is empty or has only headers');
          }

          const dataRows = rows.slice(1); // 헤더 제외
          const angles = [];
          const labels = [];

          dataRows.forEach(row => {
            const values = row.split(',').map(Number);
            if (values.length > 1) {
              angles.push(values.slice(0, -1));
              labels.push(values[values.length - 1]);
            }
          });

          if (angles.length === 0) {
            throw new Error('No valid data found in CSV');
          }

          if (!isMounted) return;
          console.log(`Loaded ${angles.length} training examples`);

          const knnModel = new KNN(angles, labels, { k: 3 });
          setKnn(knnModel);

          // 웹캠 설정
          const constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', handleVideoLoaded);
          }
        } catch (error) {
          console.error('Error loading CSV or initializing KNN:', error);
        }
      } catch (error) {
        console.error('Error initializing MediaPipe:', error);
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
          bottom: '20px',
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
