import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import openviduApi from '../api/openViduApi';

const useOpenVidu = (channelId, userName) => {
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const OV = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (session) {
      // Clean up any existing listeners to prevent duplicates
      session.off('connectionCreated');
      session.off('streamCreated');
      session.off('connectionDestroyed');
      
      // Set up event listeners
      session.on('connectionCreated', (event) => {
        console.log('Connection created:', event.connection.connectionId);
        const connectionData = JSON.parse(event.connection.data || '{}');
        const userData = connectionData.clientData ? JSON.parse(connectionData.clientData) : {};
        
        const newParticipant = {
          id: event.connection.connectionId,
          stream: null,
          isSelf: event.connection.connectionId === session.connection?.connectionId,
          name: userData.userName || 'Unknown'
        };
        
        setParticipants(prev => {
          // Check if participant already exists to avoid duplicates
          const exists = prev.some(p => p.id === newParticipant.id);
          if (!exists) {
            return [...prev, newParticipant];
          }
          return prev;
        });
      });

      session.on('streamCreated', (event) => {
        console.log('Stream created:', event.stream.connection.connectionId);
        const newStream = event.stream;
        const subscriber = session.subscribe(newStream, undefined);
        
        setSubscribers(prev => [...prev, subscriber]);
        
        setParticipants(prev => {
          const participantExists = prev.some(p => p.id === newStream.connection.connectionId);
          
          if (participantExists) {
            // Update existing participant with stream
            return prev.map(participant =>
              participant.id === newStream.connection.connectionId
                ? { ...participant, stream: subscriber }
                : participant
            );
          } else {
            // Create new participant with stream if not found
            const connectionData = JSON.parse(newStream.connection.data || '{}');
            const userData = connectionData.clientData ? JSON.parse(connectionData.clientData) : {};
            
            return [...prev, {
              id: newStream.connection.connectionId,
              stream: subscriber,
              isSelf: false,
              name: userData.userName || 'Unknown'
            }];
          }
        });
      });

      session.on('connectionDestroyed', (event) => {
        console.log('Connection destroyed:', event.connection.connectionId);
        setParticipants(prev => prev.filter(p => p.id !== event.connection.connectionId));
        setSubscribers(prev => prev.filter(sub => 
          sub.stream.connection.connectionId !== event.connection.connectionId
        ));
      });

      session.on('streamDestroyed', (event) => {
        console.log('Stream destroyed:', event.stream.connection.connectionId);
        setParticipants(prev => 
          prev.map(participant => 
            participant.id === event.stream.connection.connectionId 
              ? { ...participant, stream: null }
              : participant
          )
        );
      });
    }

    return () => {
      if (session) {
        session.off('connectionCreated');
        session.off('streamCreated');
        session.off('connectionDestroyed');
        session.off('streamDestroyed');
      }
    };
  }, [session]);

  const createAndJoinSession = async (channelId) => {
    if (!channelId) throw new Error('channelId가 필요합니다');
    if (initialized.current || isConnecting) return;
    const stringChannelId = String(channelId);

    initialized.current = true;
    setIsConnecting(true);
    setError(null);

    try {
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const sessionId = await openviduApi.createSession(channelId);
      const token = await openviduApi.getToken(stringChannelId);
      
      await mySession.connect(token, { 
        clientData: JSON.stringify({ userName, isHost: true })
      });

      const publisher = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audioEnabled,
        publishVideo: videoEnabled,
        resolution: '640x480'
      });

      await mySession.publish(publisher);
      setPublisher(publisher);

      // Add self as a participant
      setParticipants(prev => {
        const selfParticipant = {
          id: mySession.connection.connectionId,
          stream: publisher,
          isSelf: true,
          name: userName
        };
        return [selfParticipant];
      });

      sessionStorage.setItem('openviduSessionId', sessionId);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('세션 연결 실패:', error);
      setError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
      initialized.current = false;
    }
  };

  const joinExistingSession = async () => {
    if (isConnected || initialized.current) return;
    initialized.current = true;
    setIsConnecting(true);
    setError(null);

    try {
      OV.current = new OpenVidu();
      const mySession = OV.current.initSession();
      setSession(mySession);

      const token = await openviduApi.getToken(channelId);
      await mySession.connect(token, { 
        clientData: JSON.stringify({ userName, isHost: false })
      });

      const publisher = OV.current.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audioEnabled,
        publishVideo: videoEnabled,
        resolution: '640x480'
      });

      await mySession.publish(publisher);
      setPublisher(publisher);

      // Add self as a participant
      setParticipants(prev => {
        const selfParticipant = {
          id: mySession.connection.connectionId,
          stream: publisher,
          isSelf: true,
          name: userName
        };
        return [...prev, selfParticipant];
      });

      setIsConnected(true);
      sessionStorage.setItem('openviduSessionId', channelId);
      return true;
    } catch (error) {
      console.error('세션 참여 실패:', error);
      setError(error.message || '세션 참여 중 오류 발생');
      return false;
    } finally {
      setIsConnecting(false);
      initialized.current = false;
    }
  };

  const leaveSession = () => {
    if (session) {
      subscribers.forEach(sub => session.unsubscribe(sub));
      if (publisher) session.unpublish(publisher);
      session.disconnect();
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setParticipants([]);
      setIsConnected(false);
      sessionStorage.removeItem('openviduSessionId');
    }
    OV.current = null;
    initialized.current = false;
  };

  const toggleAudio = (value = null) => {
    if (publisher) {
      const newValue = value !== null ? value : !audioEnabled;
      publisher.publishAudio(newValue);
      setAudioEnabled(newValue);
    }
  };

  const toggleVideo = (value = null) => {
    if (publisher) {
      const newValue = value !== null ? value : !videoEnabled;
      publisher.publishVideo(newValue);
      setVideoEnabled(newValue);
    }
  };

  // Adding the missing renderParticipantInfo function
  const renderParticipantInfo = (participant) => {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 z-10 flex justify-between items-center">
        <span className="text-sm">{participant.name || 'Unknown'}</span>
        {participant.isSelf && <span className="text-xs bg-blue-500 px-2 py-1 rounded">Me</span>}
      </div>
    );
  };

  return {
    participants,
    setParticipants,
    session,
    publisher,
    subscribers,
    audioEnabled,
    videoEnabled,
    isConnected,
    isConnecting,
    error,
    createAndJoinSession,
    joinExistingSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
    renderParticipantInfo  // Added this missing function
  };
};

export default useOpenVidu;