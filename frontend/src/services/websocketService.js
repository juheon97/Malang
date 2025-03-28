import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.listeners = {};
    this.isConnected = false;

    // 현재 호스트명을 확인하여 로컬 환경인지 판단
    const hostname = window.location.hostname;
    let baseURL;

    // 로컬 환경이면 VITE_API_URL (예: /api/ws) 사용, 아니면 배포 URL (예: /ws) 사용
    if (hostname === 'localhost') {
      baseURL = import.meta.env.VITE_API_URL;
    } else {
      baseURL = 'https://j12d110.p.ssafy.io';
    }

    this.socketURL = `${baseURL}/ws`;
  }

  connect() {
    if (this.stompClient && this.isConnected) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => {
        // 토큰을 sessionStorage에서 불러오기
        return new SockJS(this.socketURL);
      },
      // STOMP CONNECT 명령 시 헤더에 Authorization 추가
      connectHeaders: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      this.isConnected = true;

      this.subscribe('/sub/chat', message => {
        try {
          const data = JSON.parse(message.body);
          if (this.listeners['message']) {
            this.listeners['message'].forEach(callback => callback(data));
          }
        } catch (error) {
          console.error('메시지 처리 오류:', error);
        }
      });
    };

    this.stompClient.onWebSocketClose = () => {
      this.isConnected = false;
    };

    this.stompClient.onStompError = () => {
      this.isConnected = false;
    };

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
    }
  }

  subscribe(destination, callback) {
    if (!this.stompClient || !this.isConnected) {
      return null;
    }

    return this.stompClient.subscribe(destination, callback);
  }

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

  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.removeListener(event, callback);
  }

  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback,
      );
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;
