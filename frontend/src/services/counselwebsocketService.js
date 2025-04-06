// counselWebSocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

class CounselWebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.socketURL = `${import.meta.env.VITE_API_URL}/ws`;
    this.subscriptions = new Map();
    this.isConnecting = false;
    this.pendingSubscriptions = [];
    this.isChatEnabled = true;
  }

  connect(counselorCode, accessCallback, channelCallback, chatCallback) {
    if (this.isConnecting) {
      console.log('[웹소켓] 연결 진행 중. 대기합니다.');
      if (counselorCode && accessCallback) {
        this.pendingSubscriptions.push({
          counselorCode,
          accessCallback,
          channelCallback,
          chatCallback,
        });
      }
      return;
    }

    if (this.stompClient && this.isConnected) {
      console.log('[웹소켓] 이미 연결됨. 구독만 추가합니다.');
      this.addSubscriptions(
        counselorCode,
        accessCallback,
        channelCallback,
        chatCallback,
      );
      return;
    }

    console.log(`[웹소켓] 연결 시도: ${this.socketURL}`);
    const token = sessionStorage.getItem('token');

    this.isConnecting = true;

    // 역할 확인 및 설정
    const checkAndSetRole = () => {
      const userRole = sessionStorage.getItem('userRole');
      if (!userRole || userRole === '') {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user.role) {
          sessionStorage.setItem('userRole', user.role);
          console.log('[웹소켓] 사용자 정보에서 역할 설정:', user.role);
        } else {
          const channelInfo = JSON.parse(
            sessionStorage.getItem('currentChannel') || '{}',
          );
          if (channelInfo.counselorCode) {
            sessionStorage.setItem('userRole', 'ROLE_COUNSELOR');
            console.log('[웹소켓] 채널 정보에서 상담사 역할 설정');
            if (Object.keys(user).length > 0) {
              user.role = 'ROLE_COUNSELOR';
              sessionStorage.setItem('user', JSON.stringify(user));
            }
          }
        }
      }
    };

    checkAndSetRole();

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.socketURL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[웹소켓] 연결 성공!');
        this.isConnected = true;
        this.isConnecting = false;
        if (this.pendingSubscriptions.length > 0) {
          this.pendingSubscriptions.forEach(sub => {
            this.addSubscriptions(
              sub.counselorCode,
              sub.accessCallback,
              sub.channelCallback,
              sub.chatCallback,
            );
          });
          this.pendingSubscriptions = [];
        } else {
          this.addSubscriptions(
            counselorCode,
            accessCallback,
            channelCallback,
            chatCallback,
          );
        }
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

  addSubscriptions(
    counselorCode,
    accessCallback,
    channelCallback,
    chatCallback,
  ) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 구독할 수 없습니다.');
      return;
    }

    // 기존 구독 제거
    this.removeSubscriptions(counselorCode);

    if (accessCallback) {
      const topic = `/sub/${counselorCode}`;
      console.log(`[웹소켓] 입장 요청 구독 시도: ${topic}`);
      const sub = this.stompClient.subscribe(topic, message => {
        console.log(`[웹소켓] ${topic}에서 메시지 수신:`, message);
        try {
          const parsed = JSON.parse(message.body);
          console.log('[웹소켓] 파싱된 메시지:', parsed);
          const userRole = sessionStorage.getItem('userRole');
          const user = JSON.parse(sessionStorage.getItem('user') || '{}');
          const isCounselor =
            userRole === 'ROLE_COUNSELOR' || user.role === 'ROLE_COUNSELOR';
          console.log(
            `[웹소켓] 현재 사용자 역할: ${userRole}, 상담사 여부: ${isCounselor}`,
          );

          if (parsed.event === 'join_con' || parsed.Event === 'join_con') {
            const role = parsed.role || parsed.Role;
            if (role === 'ROLE_COUNSELOR') {
              console.log('[웹소켓] 상담사 RESPONSE:', parsed);
            } else if (role === 'ROLE_USER') {
              console.log('[웹소켓] 유저 입장 REQUEST:', parsed);
              if (isCounselor) {
                console.log('[웹소켓] 상담사가 사용자 입장 요청 받음');
              }
            } else {
              console.log(
                '[웹소켓] join_con 이벤트 - 알 수 없는 role:',
                parsed,
              );
            }
          } else if (parsed.event === 'accepted') {
            console.log('[웹소켓] 상담사 수락 메시지 수신:', parsed);
          } else if (parsed.event === 'declined') {
            console.log('[웹소켓] 상담사 거절 메시지 수신:', parsed);
          }
          accessCallback(parsed);
        } catch (err) {
          console.error('[웹소켓] 메시지 파싱 실패:', err);
          console.error('원본 메시지:', message.body);
        }
      });
      this.subscriptions.set(`access-${counselorCode}`, sub);
      console.log(`[웹소켓] ${topic} 구독 성공!`);
    }

    if (channelCallback) {
      const channelTopic = `/sub/${counselorCode}/channel`;
      const channelSub = this.stompClient.subscribe(channelTopic, message => {
        try {
          const parsed = JSON.parse(message.body);
          console.log(`[웹소켓] ${channelTopic} 메시지:`, parsed);
          channelCallback(parsed);
        } catch (err) {
          console.error('[웹소켓] 채널 메시지 파싱 실패:', err);
        }
      });
      this.subscriptions.set(`channel-${counselorCode}`, channelSub);
    }

    if (chatCallback) {
      const chatTopic = `/sub/${counselorCode}/chat`;
      const chatSub = this.stompClient.subscribe(chatTopic, message => {
        try {
          const parsed = JSON.parse(message.body);
          console.log(`[웹소켓] ${chatTopic} 메시지:`, parsed);
          chatCallback(parsed);
        } catch (err) {
          console.error('[웹소켓] 채팅 메시지 파싱 실패:', err);
        }
      });
      this.subscriptions.set(`chat-${counselorCode}`, chatSub);
    }
  }

  // 공통 메시지 발행 함수
  _publishMessage(destination, messageObject, description) {
    if (!this.stompClient || !this.isConnected) {
      console.error(
        `[웹소켓] 연결되어 있지 않아 ${description} 요청을 보낼 수 없습니다.`,
      );
      return false;
    }
    try {
      const body = JSON.stringify(messageObject);
      this.stompClient.publish({ destination, body });
      console.log(`[웹소켓] ${description} 요청 전송:`, messageObject);
      return true;
    } catch (error) {
      console.error(`[웹소켓] ${description} 요청 전송 실패:`, error);
      return false;
    }
  }

  sendStartRequest(counselorCode, userId) {
    const message = {
      event: 'start',
      user: userId,
      channel: counselorCode,
      role: 'COUNSELOR_ROLE',
    };
    return this._publishMessage(`/pub/${counselorCode}`, message, '상담 시작');
  }

  sendEndRequest(counselorCode, userId) {
    const message = {
      event: 'end',
      user: userId,
      channel: counselorCode,
      role: 'COUNSELOR_ROLE',
    };
    return this._publishMessage(`/pub/${counselorCode}`, message, '상담 종료');
  }

  sendJoinRequest(counselorCode, userData) {
    try {
      const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
      const userId = Number(userObj.id) || 0;
      const counselorCodeStr = String(counselorCode);
      const channelId = Number(counselorCode) || counselorCodeStr;
      const message = {
        event: 'join_con',
        name: userData.name,
        birth: userData.birthdate,
        user: userId,
        channel: channelId,
        role: 'ROLE_USER',
      };
      console.log(
        `[웹소켓] 입장 요청 전송: /pub/${counselorCodeStr}/access`,
        message,
      );
      return this._publishMessage(
        `/pub/${counselorCodeStr}/access`,
        message,
        '입장 요청',
      );
    } catch (error) {
      console.error('[웹소켓] 입장 요청 전송 실패:', error);
      return false;
    }
  }

  sendAcceptRequest(counselorCode, userId) {
    const message = {
      event: 'accepted',
      user: userId,
      channel: counselorCode,
      role: 'ROLE_COUNSELOR',
    };
    return this._publishMessage(`/pub/${counselorCode}`, message, '수락');
  }

  sendDeclineRequest(counselorCode, userId) {
    const message = {
      event: 'declined',
      user: userId,
      channel: counselorCode,
      role: 'ROLE_COUNSELOR',
    };
    return this._publishMessage(`/pub/${counselorCode}`, message, '거절');
  }

  sendCounselorLeaveRequest(counselorCode, userId) {
    const message = {
      event: 'con_leave',
      user: userId,
      channel: counselorCode,
      role: 'ROLE_COUNSELOR',
    };
    return this._publishMessage(
      `/pub/${counselorCode}`,
      message,
      '상담사 나가기',
    );
  }

  sendUserLeaveRequest(counselorCode, userId) {
    const message = {
      event: 'user_leave',
      user: userId,
      channel: counselorCode,
      role: 'ROLE_USER',
    };
    return this._publishMessage(
      `/pub/${counselorCode}`,
      message,
      '사용자 나가기',
    );
  }
  // 채팅 메시지 발송 함수
  sendChatMessage(counselorCode, userId, sender, message) {
    const payload = {
      event: 'chat',
      user: userId,
      sender: sender,
      content: message,
      channel: counselorCode,
      timestamp: new Date().toISOString(),
    };
    return this._publishMessage(
      `/pub/${counselorCode}/chat_recd`,
      payload,
      '채팅 메시지',
    );
  }

  // 채팅 활성화 상태 설정
  setChatEnabled(enabled) {
    this.isChatEnabled = enabled;
  }

  // 채팅 활성화 상태 확인
  isChatActive() {
    return this.isChatEnabled;
  }
}

const counselWebSocketService = new CounselWebSocketService();
export default counselWebSocketService;
