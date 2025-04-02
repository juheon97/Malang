import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class CounselWebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.socketURL = `${import.meta.env.VITE_API_URL}/ws`;
  }

  connect(counselorCode, chatCallback, channelCallback) {
    if (this.stompClient && this.isConnected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.socketURL),
      connectHeaders: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected = true;

        if (counselorCode) {
          if (chatCallback) {
            this.subscribe(`/sub/${counselorCode}/chat`, chatCallback);
          }
          if (channelCallback) {
            this.subscribe(`/sub/${counselorCode}`, channelCallback);
          }
        }
      },
      onWebSocketClose: () => {
        this.isConnected = false;
      },
      onStompError: frame => {
        console.error('STOMP 에러:', frame);
        this.isConnected = false;
      },
    });

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

  sendMessage(destination, payload) {
    if (!this.stompClient || !this.isConnected) return false;

    try {
      this.stompClient.publish({
        destination,
        body: payload,
        headers: { 'content-type': 'application/json' },
      });
      return true;
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      return false;
    }
  }

  sendJoinEvent(counselorCode, userId) {
    const payload = JSON.stringify({
      event: 'join',
      user_id: parseInt(userId, 10),
      channel: parseInt(counselorCode, 10),
    });
    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  sendLeaveEvent(counselorCode, userId) {
    const payload = JSON.stringify({
      event: 'leave',
      user_id: parseInt(userId, 10),
      channel: parseInt(counselorCode, 10),
    });
    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  sendChatMessage(counselorCode, messageObj) {
    const payload = JSON.stringify(messageObj);
    return this.sendMessage(`/pub/${counselorCode}/chat`, payload);
  }
}

const counselWebSocketService = new CounselWebSocketService();
export default counselWebSocketService;
