import React, { useRef, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import * as KNN from 'ml-knn';
import { split_syllables, join_jamos } from 'hangul-utils';
// import { join_jamos } from 'hangul-utils/hangul_utils';

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

const SignLanguageTranslator = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sentence, setSentence] = useState('');
  const [mergeJamo, setMergeJamo] = useState('');
  const [lastConsonant, setLastConsonant] = useState(null);
  const [lastConsonantTime, setLastConsonantTime] = useState(0);
  const [knn, setKnn] = useState(null);
  const doubleConsonantThreshold = 1500; // 1.5초
  const holdTime = 2000; // 2초

  // MediaPipe 초기화
  useEffect(() => {
    const initializeMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        numHands: 1,
        runningMode: 'VIDEO',
      });

      // KNN 모델 초기화
      const response = await fetch('data/gesture_train.csv');
      const csvData = await response.text();
      const rows = csvData.split('\n').slice(1);
      const angles = [];
      const labels = [];

      rows.forEach(row => {
        const values = row.split(',').map(Number);
        angles.push(values.slice(0, -1));
        labels.push(values[values.length - 1]);
      });

      const knnModel = new KNN(angles, labels, { k: 3 });
      setKnn(knnModel);

      // 웹캠 설정
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          processFrame(handLandmarker);
        });
      });
    };

    initializeMediaPipe();
  }, []);

  const processFrame = async handLandmarker => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    const process = async () => {
      const results = await handLandmarker.detectForVideo(
        videoRef.current,
        Date.now(),
      );

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(videoRef.current, 0, 0);

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          // 각도 계산
          const angles = calculateAngles(landmarks);

          // KNN 예측
          const prediction = knn.predict([angles]);
          handleGesture(prediction[0]);

          // 랜드마크 그리기
          drawConnectors(ctx, landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2,
          });
          drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
        }
      }
      requestAnimationFrame(process);
    };
    process();
  };

  const calculateAngles = landmarks => {
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
  };

  const handleGesture = idx => {
    const currentTime = Date.now();

    if (gestureMap[idx]) {
      if (currentTime - lastConsonantTime > holdTime) {
        handleDoubleConsonant(idx, currentTime);
        handleVowelsAndControls(idx);
      }
    }
  };

  const handleDoubleConsonant = (idx, currentTime) => {
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
  };

  const handleVowelsAndControls = idx => {
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
  };

  return (
    <div className="translator-container">
      <video ref={videoRef} autoPlay playsInline className="video-feed" />
      <canvas ref={canvasRef} className="output-canvas" />

      <div className="text-overlay">
        <div className="sentence">{sentence}</div>
        <div className="jamo">{mergeJamo}</div>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;
