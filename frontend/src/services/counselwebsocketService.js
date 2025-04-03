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

    // 기존 구독 제거
    this.removeSubscriptions(counselorCode);

    if (accessCallback) {
      // 구독 주소 수정: "/sub/{counselor_code}"로 변경
      const topic = `/sub/${counselorCode}`;
      console.log(`[웹소켓] 입장 요청 구독 시도: ${topic}`);
      const sub = this.stompClient.subscribe(topic, message => {
        console.log(`[웹소켓] ${topic}에서 메시지 수신:`, message);
        try {
          const parsed = JSON.parse(message.body);
          // 최신 명세에 따른 키 "Event", "role" 등 사용
          if (parsed.Event === 'join_con') {
            if (parsed.role === 'COUNSEL_ROLE') {
              console.log('[웹소켓] 상담사 RESPONSE:', parsed);
            } else if (parsed.role === 'USER_ROLE') {
              console.log('[웹소켓] 유저 입장 REQUEST:', parsed);
            } else {
              console.log(
                '[웹소켓] join_con 이벤트 - 알 수 없는 role:',
                parsed,
              );
            }
          }
          accessCallback(parsed);
        } catch (err) {
          console.error('[웹소켓] 메시지 파싱 실패:', err);
        }
      });
      // 기존 subscription 키도 그대로 사용
      this.subscriptions.set(`access-${counselorCode}`, sub);
      console.log(`[웹소켓] ${topic} 구독 성공!`);
    }
  }

  sendJoinRequest(counselorCode, userData) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 요청을 보낼 수 없습니다.');
      return false;
    }

    try {
      // sessionStorage에서 사용자 객체를 가져와 userId를 숫자로 변환
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = Number(userObj.id) || 0;

      // counselorCode를 문자열 및 숫자로 변환
      const counselorCodeStr = String(counselorCode);
      const channelId = Number(counselorCode) || counselorCodeStr;

      const orderedMessage = {
        event: 'join_con',
        name: userData.name,
        birth: userData.birthdate,
        user: userId,
        channel: channelId,
        role: 'USER_ROLE',
      };

      // JSON 문자열로 변환하여 로그 출력 (키 순서가 보장됨)
      const messageString = JSON.stringify(orderedMessage, null, 2);
      console.log(
        `[웹소켓] 입장 요청 전송: /pub/${counselorCodeStr}/access\n${messageString}`,
      );

      // 메시지 전송
      this.stompClient.publish({
        destination: `/pub/${counselorCodeStr}/access`,
        body: JSON.stringify(orderedMessage),
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
