import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class CounselWebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.socketURL = `${import.meta.env.VITE_API_URL}/ws`;
    this.subscriptions = new Map();
    this.isConnecting = false;
  }

  connect(counselorCode, accessCallback) {
    if (this.isConnecting) {
      console.log('[웹소켓] 연결 진행 중. 대기합니다.');
      // 연결이 완료된 후 구독을 추가하기 위해 이벤트 리스너를 등록할 수 있습니다.
      return;
    }

    if (this.stompClient && this.isConnected) {
      console.log('[웹소켓] 이미 연결됨. 구독만 추가합니다.');
      this.addSubscriptions(counselorCode, accessCallback);
      return;
    }

    console.log(`[웹소켓] 연결 시도: ${this.socketURL}`);
    const token = sessionStorage.getItem('token');

    this.isConnecting = true;

    this.stompClient = new Client({
      webSocketFactory: () => {
        const socket = new SockJS(this.socketURL);
        return socket;
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[웹소켓] 연결 성공!');
        this.isConnected = true;
        this.isConnecting = false;
        this.addSubscriptions(counselorCode, accessCallback);
      },
      onWebSocketClose: evt => {
        console.warn('[웹소켓] 연결 종료:', evt);
        this.isConnected = false;
        this.isConnecting = false;
        this.subscriptions.clear();
      },
      onStompError: frame => {
        console.error('[웹소켓] STOMP 에러:', frame);
        this.isConnected = false;
        this.isConnecting = false;
      },
    });

    this.stompClient.activate();
  }

  removeSubscriptions(counselorCode) {
    const key = `access-${counselorCode}`;
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
      console.log(`[웹소켓] ${key} 구독 제거됨`);
    }
  }

  addSubscriptions(counselorCode, accessCallback) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 구독할 수 없습니다.');
      return;
    }

    this.removeSubscriptions(counselorCode);

    if (accessCallback) {
      const topic = `/sub/${counselorCode}/access`;
      console.log(`[웹소켓] 입장 요청 구독 시도: ${topic}`);
      const sub = this.stompClient.subscribe(topic, message => {
        console.log(`[웹소켓] ${topic}에서 메시지 수신:`, message);
        try {
          const parsed = JSON.parse(message.body);
          console.log(`[웹소켓] 파싱된 메시지:`, parsed);
          accessCallback(parsed);
        } catch (err) {
          console.error('[웹소켓] 메시지 파싱 실패:', err);
        }
      });
      this.subscriptions.set(`access-${counselorCode}`, sub);
      console.log(`[웹소켓] ${topic} 구독 성공!`);
    }
  }

  // 입장 요청 전송 메서드 추가
  // 입장 요청 전송 메서드 추가
  sendJoinRequest(counselorCode, userData) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 요청을 보낼 수 없습니다.');
      return false;
    }

    try {
      // sessionStorage에서 사용자 ID 가져오기
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = userObj.id || 'unknown';

      // counselorCode가 숫자인 경우 문자열로 변환 (API 호출 시 일관성을 위해)
      const counselorCodeStr = String(counselorCode);

      // 요청 메시지 구성
      const requestMessage = {
        event: 'join_con',
        name: userData.name,
        생년월일: userData.birthdate,
        user: userId,
        channel: counselorCodeStr,
        role: 'USER_ROLE',
      };

      console.log(
        `[웹소켓] 입장 요청 전송: /pub/${counselorCodeStr}/access`,
        requestMessage,
      );

      // 메시지 전송
      this.stompClient.publish({
        destination: `/pub/${counselorCodeStr}/access`,
        body: JSON.stringify(requestMessage),
      });

      return true;
    } catch (error) {
      console.error('[웹소켓] 입장 요청 전송 실패:', error);
      return false;
    }
  }

  // 상담사가 입장 요청을 수락하는 메서드
  sendAcceptRequest(counselorCode, userId) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 요청을 보낼 수 없습니다.');
      return false;
    }

    try {
      const responseMessage = {
        event: 'accept_con',
        user: userId,
        channel: counselorCode,
      };

      console.log(
        `[웹소켓] 입장 요청 수락: /pub/${counselorCode}/access`,
        responseMessage,
      );

      this.stompClient.publish({
        destination: `/pub/${counselorCode}/access`,
        body: JSON.stringify(responseMessage),
      });

      return true;
    } catch (error) {
      console.error('[웹소켓] 입장 요청 수락 실패:', error);
      return false;
    }
  }

  // 상담사가 입장 요청을 거절하는 메서드
  sendDeclineRequest(counselorCode, userId) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 요청을 보낼 수 없습니다.');
      return false;
    }

    try {
      const responseMessage = {
        event: 'decline_con',
        user: userId,
        channel: counselorCode,
      };

      console.log(
        `[웹소켓] 입장 요청 거절: /pub/${counselorCode}/access`,
        responseMessage,
      );

      this.stompClient.publish({
        destination: `/pub/${counselorCode}/access`,
        body: JSON.stringify(responseMessage),
      });

      return true;
    } catch (error) {
      console.error('[웹소켓] 입장 요청 거절 실패:', error);
      return false;
    }
  }
}

const counselWebSocketService = new CounselWebSocketService();
export default counselWebSocketService;
