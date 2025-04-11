import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.socketURL = `${import.meta.env.VITE_API_URL}/ws`;
  }

  connect(channelId, chatCallback, channelCallback) {
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

        if (channelId) {
          if (chatCallback) {
            this.subscribe(`/sub/${channelId}/chat`, chatCallback);
          }
          if (channelCallback) {
            this.subscribe(`/sub/${channelId}`, channelCallback);
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

  sendJoinEvent(channelId, userId) {
    const payload = JSON.stringify({
      event: 'join',
      user: parseInt(userId, 10),
      channel: parseInt(channelId, 10),
    });

    // 백엔드로 보내는 데이터 콘솔에 출력
    console.log('📤 백엔드로 전송하는 JOIN 이벤트:', JSON.parse(payload));

    return this.sendMessage(`/pub/${channelId}`, payload);
  }

  sendLeaveEvent(channelId, userId) {
    const payload = JSON.stringify({
      event: 'leave',
      user: parseInt(userId, 10),
      channel: parseInt(channelId, 10),
    });

    // 백엔드로 보내는 데이터 콘솔에 출력
    console.log('📤 백엔드로 전송하는 LEAVE 이벤트:', JSON.parse(payload));

    return this.sendMessage(`/pub/${channelId}`, payload);
  }

  sendChatMessage(channelId, messageObj) {
    const payload = JSON.stringify(messageObj);
    return this.sendMessage(`/pub/${channelId}/chat`, payload);
  }
}

const websocketService = new WebSocketService();
export default websocketService;
