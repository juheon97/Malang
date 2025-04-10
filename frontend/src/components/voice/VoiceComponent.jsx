// components/voice/VoiceComponent.jsx
import React, { useState, useRef, useEffect } from 'react';
import voiceChangeApi from '../../api/voiceChangeApi';

const VoiceComponent = ({ onTranscriptionResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', event => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', async () => {
        const webmBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });

        try {
          const url = URL.createObjectURL(webmBlob);
          setAudioUrl(url);

          setIsLoading(true);
          const result = await voiceChangeApi.convertSpeechToText(webmBlob);

          if (result && result.text) {
            setTranscribedText(result.text);
            // 결과를 부모 컴포넌트로 전달
            if (onTranscriptionResult) {
              onTranscriptionResult(result.text);
            }
          } else {
            setTranscribedText('음성을 인식하지 못했습니다.');
          }
        } catch (error) {
          console.error('음성 변환 오류:', error);
          setTranscribedText('음성 변환 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach(track => track.stop());
    }
  };

  // 컴포넌트 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  return (
    <div className="voice-component p-4 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold mb-2">음성 번역</h3>
          <p className="text-sm text-gray-600">
            {isRecording ? '말하고 있는 중...' : '버튼을 누르고 말하세요'}
          </p>
        </div>

        <button
          className={`w-full py-2 rounded-lg transition duration-300 ${
            isRecording
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isRecording ? '녹음 중지' : '음성 녹음 시작'}
        </button>

        {isLoading && (
          <div className="mt-3 text-center">
            <p>변환 중...</p>
          </div>
        )}

        {transcribedText && !isLoading && (
          <div className="mt-3 p-2 bg-gray-100 rounded w-full">
            <p className="text-sm">{transcribedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceComponent;
