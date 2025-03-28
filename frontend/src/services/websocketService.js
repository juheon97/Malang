import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.listeners = {};
    this.isConnected = false;

    // SockJS WebSocket 서버 연결 URL (http(s)로 시작해야 함)
    this.socketURL = 'https://j12d110.p.ssafy.io/ws'; // 여기 포인트!
  }

  connect() {
    if (this.stompClient && this.isConnected) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.socketURL), // ✅ 핵심 수정
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
