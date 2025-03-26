// services/websocketService.js
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.listeners = {};
    this.isConnected = false;

    // WebSocket 서버 연결 URL
    this.brokerURL = 'wss://e027-14-46-141-204.ngrok-free.app/ws';
  }

  connect() {
    if (this.stompClient && this.isConnected) {
      return;
    }

    // STOMP 클라이언트 생성
    this.stompClient = new Client({
      brokerURL: this.brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 이벤트
    this.stompClient.onConnect = () => {
      this.isConnected = true;

      // 기본 채팅 채널 구독
      this.subscribe('/sub/chat', message => {
        try {
          const data = JSON.parse(message.body);
          if (this.listeners['message']) {
            this.listeners['message'].forEach(callback => callback(data));
          }
        } catch (error) {
          // 메시지 처리 오류
        }
      });
    };

    // 연결 종료 이벤트
    this.stompClient.onWebSocketClose = () => {
      this.isConnected = false;
    };

    // STOMP 오류 이벤트
    this.stompClient.onStompError = () => {
      this.isConnected = false;
    };

    // 연결 시작
    this.stompClient.activate();
  }

  // 연결 종료
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
    }
  }

  // 채널 구독
  subscribe(destination, callback) {
    if (!this.stompClient || !this.isConnected) {
      return null;
    }

    return this.stompClient.subscribe(destination, callback);
  }

  // 메시지 전송
  sendMessage(event, content, destination = '/pub/chat') {
    if (!this.stompClient || !this.isConnected) {
      return false;
    }

    try {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify({ event, content }),
        headers: { 'content-type': 'application/json' },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 리스너 추가
  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.removeListener(event, callback);
  }

  // 리스너 제거
  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback,
      );
    }
  }
}

// 싱글톤 인스턴스 생성
const websocketService = new WebSocketService();
export default websocketService;
