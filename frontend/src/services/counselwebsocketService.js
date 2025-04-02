import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class CounselWebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.socketURL = `${import.meta.env.VITE_API_URL}/ws`;
    this.subscriptions = new Map();
  }

  /**
   * 웹소켓 연결 및 구독
   * @param {string|number} counselorCode - 상담사 코드
   * @param {function} accessCallback - 입장 요청 관련 콜백
   * @param {function} channelCallback - 채널 이벤트 콜백
   * @param {function} chatCallback - 채팅 메시지 콜백
   */
  connect(counselorCode, accessCallback, channelCallback, chatCallback) {
    if (this.stompClient && this.isConnected) {
      console.log('이미 웹소켓에 연결되어 있습니다');
      // 기존 연결이 있으면 구독만 추가
      this.addSubscriptions(
        counselorCode,
        accessCallback,
        channelCallback,
        chatCallback,
      );
      return;
    }

    console.log(
      `웹소켓 연결 시도: ${this.socketURL}, 상담사 코드: ${counselorCode}`,
    );

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.socketURL),
      connectHeaders: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('웹소켓 연결 성공!');
        this.isConnected = true;

        // 연결 후 구독 추가
        this.addSubscriptions(
          counselorCode,
          accessCallback,
          channelCallback,
          chatCallback,
        );
      },
      onWebSocketClose: evt => {
        console.warn('웹소켓 연결 종료:', evt);
        this.isConnected = false;
        // 구독 정보 초기화
        this.subscriptions.clear();
      },
      onStompError: frame => {
        console.error('STOMP 에러:', frame);
        this.isConnected = false;
      },
      debug: function (str) {
        // 개발용 디버그 메시지
        if (import.meta.env.DEV) {
          console.log('STOMP: ' + str);
        }
      },
    });

    this.stompClient.activate();
  }

  /**
   * 구독 추가
   */
  addSubscriptions(
    counselorCode,
    accessCallback,
    channelCallback,
    chatCallback,
  ) {
    if (!this.stompClient || !this.isConnected) {
      console.error('웹소켓에 연결되어 있지 않아 구독할 수 없습니다');
      return;
    }

    // 기존 구독 제거 (동일 채널에 대한 중복 구독 방지)
    this.removeSubscriptions(counselorCode);

    if (counselorCode) {
      console.log(`구독 추가: 상담사 코드 ${counselorCode}`);

      // 1. 입장 요청 구독
      if (accessCallback) {
        const accessSub = this.stompClient.subscribe(
          `/sub/${counselorCode}/access`,
          message => {
            console.log('입장 요청 메시지 수신:', message.body);
            try {
              const parsedMessage = JSON.parse(message.body);
              accessCallback(parsedMessage);
            } catch (error) {
              console.error('입장 요청 메시지 파싱 오류:', error);
            }
          },
        );
        this.subscriptions.set(`access-${counselorCode}`, accessSub);
      }

      // 2. 채널 이벤트 구독
      if (channelCallback) {
        const channelSub = this.stompClient.subscribe(
          `/sub/${counselorCode}`,
          message => {
            console.log('채널 이벤트 메시지 수신:', message.body);
            try {
              const parsedMessage = JSON.parse(message.body);
              channelCallback(parsedMessage);
            } catch (error) {
              console.error('채널 이벤트 메시지 파싱 오류:', error);
            }
          },
        );
        this.subscriptions.set(`channel-${counselorCode}`, channelSub);
      }

      // 3. 채팅 메시지 구독
      if (chatCallback) {
        const chatSub = this.stompClient.subscribe(
          `/sub/${counselorCode}/chat`,
          message => {
            console.log('채팅 메시지 수신:', message.body);
            try {
              const parsedMessage = JSON.parse(message.body);
              chatCallback(parsedMessage);
            } catch (error) {
              console.error('채팅 메시지 파싱 오류:', error);
            }
          },
        );
        this.subscriptions.set(`chat-${counselorCode}`, chatSub);
      }
    }
  }

  /**
   * 특정 채널의 구독 제거
   */
  removeSubscriptions(counselorCode) {
    if (!counselorCode) return;

    // 해당 채널에 대한 모든 구독 제거
    const prefixes = ['access-', 'channel-', 'chat-'];
    prefixes.forEach(prefix => {
      const key = `${prefix}${counselorCode}`;
      if (this.subscriptions.has(key)) {
        try {
          this.subscriptions.get(key).unsubscribe();
          console.log(`구독 제거: ${key}`);
        } catch (error) {
          console.warn(`구독 제거 실패: ${key}`, error);
        }
        this.subscriptions.delete(key);
      }
    });
  }

  /**
   * 웹소켓 연결 종료
   */
  disconnect() {
    if (this.stompClient) {
      console.log('웹소켓 연결 종료 중');

      // 모든 구독 제거
      for (const [key, subscription] of this.subscriptions.entries()) {
        try {
          subscription.unsubscribe();
          console.log(`구독 제거: ${key}`);
        } catch (error) {
          console.warn(`구독 제거 실패: ${key}`, error);
        }
      }
      this.subscriptions.clear();

      // 연결 종료
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
      console.log('웹소켓 연결 종료 완료');
    }
  }

  /**
   * 일반 메시지 전송
   * @param {string} destination - 목적지
   * @param {string} payload - JSON 문자열
   * @returns {boolean} 전송 성공 여부
   */
  sendMessage(destination, payload) {
    if (!this.stompClient || !this.isConnected) {
      console.error('웹소켓에 연결되어 있지 않아 메시지를 전송할 수 없습니다');
      return false;
    }

    try {
      console.log(`메시지 전송: ${destination}`, payload);
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

  /**
   * 사용자 입장 요청 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {Object} userData - 사용자 정보
   * @returns {boolean} 전송 성공 여부
   */
  sendJoinRequest(counselorCode, userData) {
    const { name, birthdate, userId } = userData;

    const payload = JSON.stringify({
      event: 'join_con',
      name: name,
      생년월일: birthdate,
      user: userId,
      channel: counselorCode,
      role: 'USER_ROLE',
    });

    return this.sendMessage(`/pub/${counselorCode}/access`, payload);
  }

  /**
   * 상담사 입장 요청 수락 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {string|number} userId - 요청 사용자 ID
   * @returns {boolean} 전송 성공 여부
   */
  sendAcceptRequest(counselorCode, userId) {
    // 세션 스토리지에서 자신의 상담사 ID 가져오기
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const counselorId = user.id;

    const payload = JSON.stringify({
      event: 'accepted',
      user: userId,
      channel: counselorCode,
      role: 'COUNSEL_ROLE',
    });

    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  /**
   * 상담사 입장 요청 거절 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {string|number} userId - 요청 사용자 ID
   * @returns {boolean} 전송 성공 여부
   */
  sendDeclineRequest(counselorCode, userId) {
    const payload = JSON.stringify({
      event: 'declined',
      user: userId,
      channel: counselorCode,
      role: 'COUNSEL_ROLE',
    });

    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  /**
   * 사용자 요청 취소 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {string|number} userId - 사용자 ID
   * @returns {boolean} 전송 성공 여부
   */
  sendCancelRequest(counselorCode, userId) {
    const payload = JSON.stringify({
      event: 'decline',
      user: userId,
      channel: counselorCode,
      role: 'USER_ROLE',
    });

    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  /**
   * 상담사 나가기 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {string|number} userId - 상담사 ID
   * @returns {boolean} 전송 성공 여부
   */
  sendCounselorLeave(counselorCode, userId) {
    const payload = JSON.stringify({
      event: 'con_leave',
      user: userId,
      channel: counselorCode,
      role: 'COUNSEL_ROLE',
    });

    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  /**
   * 사용자 나가기 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {string|number} userId - 사용자 ID
   * @returns {boolean} 전송 성공 여부
   */
  sendUserLeave(counselorCode, userId) {
    const payload = JSON.stringify({
      event: 'user_leave',
      user: userId,
      channel: counselorCode,
      role: 'USER_ROLE',
    });

    return this.sendMessage(`/pub/${counselorCode}`, payload);
  }

  /**
   * 채팅 메시지 전송
   * @param {string|number} counselorCode - 상담사 코드
   * @param {Object} messageObj - 메시지 객체
   * @returns {boolean} 전송 성공 여부
   */
  sendChatMessage(counselorCode, messageObj) {
    const payload = JSON.stringify(messageObj);
    return this.sendMessage(`/pub/${counselorCode}/chat`, payload);
  }
}

// 싱글톤 인스턴스
const counselWebSocketService = new CounselWebSocketService();
export default counselWebSocketService;
