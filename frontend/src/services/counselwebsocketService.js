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
      console.log('[웹소켓] 이미 웹소켓에 연결되어 있습니다');
      console.log('[웹소켓] 웹소켓 URL:', this.socketURL);
      console.log('[웹소켓] 상담사 코드:', counselorCode);

      // 기존 연결이 있으면 구독만 추가
      console.log('[웹소켓] 기존 연결에 구독 추가 시도');
      this.addSubscriptions(
        counselorCode,
        accessCallback,
        channelCallback,
        chatCallback,
      );
      return;
    }

    console.log(
      `[웹소켓] 연결 시도: ${this.socketURL}, 상담사 코드: ${counselorCode}`,
    );
    const token = sessionStorage.getItem('token');
    console.log(
      '[웹소켓] 연결에 사용되는 토큰:',
      token ? `${token.substring(0, 15)}...` : 'null',
    );

    this.stompClient = new Client({
      webSocketFactory: () => {
        const socket = new SockJS(this.socketURL);
        console.log('[웹소켓] SockJS 객체 생성됨:', this.socketURL);

        // 소켓 이벤트 리스너 추가
        socket.onopen = () => {
          console.log('[웹소켓] SockJS 소켓 연결됨');
        };

        socket.onerror = error => {
          console.error('[웹소켓] SockJS 소켓 에러:', error);
        };

        socket.onclose = event => {
          console.warn('[웹소켓] SockJS 소켓 닫힘:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
        };

        return socket;
      },
      connectHeaders: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: frame => {
        console.log('[웹소켓] 연결 성공!');
        console.log('[웹소켓] STOMP 세션 ID:', this.stompClient.sessionId);
        this.isConnected = true;

        // 연결 후 구독 추가
        console.log('[웹소켓] 연결 후 구독 추가 시도');
        this.addSubscriptions(
          counselorCode,
          accessCallback,
          channelCallback,
          chatCallback,
        );
      },
      onWebSocketClose: evt => {
        console.warn('[웹소켓] 연결 종료:', evt);
        this.isConnected = false;
        // 구독 정보 초기화
        this.subscriptions.clear();
      },
      onStompError: frame => {
        console.error('[웹소켓] STOMP 에러:', frame);
        this.isConnected = false;
      },
      debug: function (str) {
        // 개발용 디버그 메시지
        if (import.meta.env.DEV) {
          console.log('[STOMP 디버그] ' + str);
        }
      },
    });

    console.log('[웹소켓] STOMP 클라이언트 활성화 시도');
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
      console.error('[웹소켓] 연결되어 있지 않아 구독할 수 없습니다');
      return;
    }

    // 기존 구독 제거 (동일 채널에 대한 중복 구독 방지)
    this.removeSubscriptions(counselorCode);

    if (counselorCode) {
      console.log(`[웹소켓] 구독 추가: 상담사 코드 ${counselorCode}`);

      // 1. 입장 요청 구독
      if (accessCallback) {
        const accessTopic = `/sub/${counselorCode}/access`;
        console.log(`[웹소켓] 입장 요청 토픽 구독: ${accessTopic}`);

        const accessSub = this.stompClient.subscribe(accessTopic, message => {
          console.log('[웹소켓] 입장 요청 메시지 수신:', message.body);
          console.log('[웹소켓] 메시지 헤더:', message.headers);

          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('[웹소켓] 파싱된 입장 요청 메시지:', parsedMessage);

            // 사용자 역할 정보 디버깅
            const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
            const userRole = sessionStorage.getItem('userRole');
            console.log('[웹소켓] 현재 사용자 정보:', userObj);
            console.log('[웹소켓] 현재 사용자 역할:', userRole);
            console.log('[웹소켓] isHost 여부 확인 필요');

            accessCallback(parsedMessage);
          } catch (error) {
            console.error('[웹소켓] 입장 요청 메시지 파싱 오류:', error);
          }
        });
        this.subscriptions.set(`access-${counselorCode}`, accessSub);
        console.log(`[웹소켓] 입장 요청 구독 완료: ${accessTopic}`);
      }

      // 2. 채널 이벤트 구독
      if (channelCallback) {
        const channelTopic = `/sub/${counselorCode}`;
        console.log(`[웹소켓] 채널 이벤트 토픽 구독: ${channelTopic}`);

        const channelSub = this.stompClient.subscribe(channelTopic, message => {
          console.log('[웹소켓] 채널 이벤트 메시지 수신:', message.body);
          console.log('[웹소켓] 메시지 헤더:', message.headers);

          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('[웹소켓] 파싱된 채널 이벤트 메시지:', parsedMessage);
            channelCallback(parsedMessage);
          } catch (error) {
            console.error('[웹소켓] 채널 이벤트 메시지 파싱 오류:', error);
          }
        });
        this.subscriptions.set(`channel-${counselorCode}`, channelSub);
        console.log(`[웹소켓] 채널 이벤트 구독 완료: ${channelTopic}`);
      }

      // 3. 채팅 메시지 구독
      if (chatCallback) {
        const chatTopic = `/sub/${counselorCode}/chat`;
        console.log(`[웹소켓] 채팅 메시지 토픽 구독: ${chatTopic}`);

        const chatSub = this.stompClient.subscribe(chatTopic, message => {
          console.log('[웹소켓] 채팅 메시지 수신:', message.body);
          console.log('[웹소켓] 메시지 헤더:', message.headers);

          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('[웹소켓] 파싱된 채팅 메시지:', parsedMessage);
            chatCallback(parsedMessage);
          } catch (error) {
            console.error('[웹소켓] 채팅 메시지 파싱 오류:', error);
          }
        });
        this.subscriptions.set(`chat-${counselorCode}`, chatSub);
        console.log(`[웹소켓] 채팅 메시지 구독 완료: ${chatTopic}`);
      }

      console.log(`[웹소켓] ${counselorCode}에 대한 모든 구독 완료`);
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
    console.log('[웹소켓] 입장 요청 메시지 생성:', {
      counselorCode: counselorCode,
      userData: userData,
    });

    // 세션 스토리지에서 사용자 ID 확인
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const actualUserId = userId || user.id || user.userId || Date.now();

    console.log('[웹소켓] 사용할 사용자 ID:', actualUserId);

    const payload = JSON.stringify({
      event: 'join_con',
      name: name,
      생년월일: birthdate,
      user: actualUserId,
      channel: counselorCode,
      role: 'USER_ROLE',
    });

    console.log('[웹소켓] 전송할 페이로드:', payload);
    console.log(`[웹소켓] 전송 대상: /pub/${counselorCode}/access`);

    const result = this.sendMessage(`/pub/${counselorCode}/access`, payload);
    console.log('[웹소켓] 메시지 전송 결과:', result ? '성공' : '실패');
    return result;
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

    console.log('입장 요청 수락 메시지 생성:', {
      counselorCode: counselorCode,
      userId: userId,
      counselorId: counselorId,
    });

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
    console.log('입장 요청 거절 메시지 생성:', {
      counselorCode: counselorCode,
      userId: userId,
    });

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
    console.log('요청 취소 메시지 생성:', {
      counselorCode: counselorCode,
      userId: userId,
    });

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
    console.log('상담사 나가기 메시지 생성:', {
      counselorCode: counselorCode,
      userId: userId,
    });

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
    console.log('사용자 나가기 메시지 생성:', {
      counselorCode: counselorCode,
      userId: userId,
    });

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
    console.log('채팅 메시지 전송:', {
      counselorCode: counselorCode,
      messageObj: messageObj,
    });

    const payload = JSON.stringify(messageObj);
    return this.sendMessage(`/pub/${counselorCode}/chat`, payload);
  }
}

// 싱글톤 인스턴스
const counselWebSocketService = new CounselWebSocketService();
export default counselWebSocketService;
