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
  }

  connect(counselorCode, accessCallback, channelCallback, chatCallback) {
    if (this.isConnecting) {
      console.log('[웹소켓] 연결 진행 중. 대기합니다.');
      // 연결이 완료되면 추가할 구독을 대기열에 추가
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
        // 사용자 정보에서 역할 확인
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user.role) {
          sessionStorage.setItem('userRole', user.role);
          console.log('[웹소켓] 사용자 정보에서 역할 설정:', user.role);
        } else {
          // 상담사 여부 확인 (채널 방에 있으면 상담사로 간주)
          const channelInfo = JSON.parse(
            sessionStorage.getItem('currentChannel') || '{}',
          );
          if (channelInfo.counselorCode) {
            sessionStorage.setItem('userRole', 'ROLE_COUNSELOR');
            console.log('[웹소켓] 채널 정보에서 상담사 역할 설정');

            // 사용자 정보에도 역할 추가
            if (Object.keys(user).length > 0) {
              user.role = 'ROLE_COUNSELOR';
              sessionStorage.setItem('user', JSON.stringify(user));
            }
          }
        }
      }
    };

    // 역할 확인 및 설정
    checkAndSetRole();

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

        // 대기 중인 구독 처리
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
          // 직접 전달된 콜백으로 구독 추가
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
      // 구독 주소 수정: "/sub/{counselor_code}"로 변경
      const topic = `/sub/${counselorCode}`;
      console.log(`[웹소켓] 입장 요청 구독 시도: ${topic}`);
      const sub = this.stompClient.subscribe(topic, message => {
        console.log(`[웹소켓] ${topic}에서 메시지 수신:`, message);
        try {
          const parsed = JSON.parse(message.body);

          // 메시지 처리 전에 로그 출력
          console.log(`[웹소켓] 파싱된 메시지:`, parsed);

          // 사용자 역할 정보 확인
          const userRole = sessionStorage.getItem('userRole');
          const user = JSON.parse(sessionStorage.getItem('user') || '{}');
          const isCounselor =
            userRole === 'ROLE_COUNSELOR' ||
            userRole === 'counselor' ||
            user.role === 'ROLE_COUNSELOR' ||
            user.role === 'counselor';

          console.log(
            `[웹소켓] 현재 사용자 역할: ${userRole}, 상담사 여부: ${isCounselor}`,
          );

          // 최신 명세에 따른 키 "Event", "role" 등 사용
          if (parsed.event === 'join_con' || parsed.Event === 'join_con') {
            // event 또는 Event 필드 표준화
            const event = parsed.event || parsed.Event;
            const role = parsed.role || parsed.Role;

            if (role === 'ROLE_COUNSELOR') {
              console.log('[웹소켓] 상담사 RESPONSE:', parsed);
            } else if (role === 'ROLE_USER') {
              console.log('[웹소켓] 유저 입장 REQUEST:', parsed);

              // 상담사이고 사용자 입장 요청인 경우 특별 처리
              if (isCounselor) {
                console.log('[웹소켓] 상담사가 사용자 입장 요청 받음');
                // 추가 처리 가능
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
      // 기존 subscription 키도 그대로 사용
      this.subscriptions.set(`access-${counselorCode}`, sub);
      console.log(`[웹소켓] ${topic} 구독 성공!`);
    }

    // 채널 및 채팅 콜백 추가
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

  sendStartRequest(counselorCode, userId) {
    if (!this.stompClient || !this.isConnected) {
      console.error(
        '[웹소켓] 연결되어 있지 않아 상담 시작 요청을 보낼 수 없습니다.',
      );
      return false;
    }
    try {
      const requestMessage = {
        event: 'start',
        user: userId,
        channel: counselorCode,
        role: 'COUNSELOR_ROLE',
      };
      this.stompClient.publish({
        destination: `/pub/${counselorCode}`,
        body: JSON.stringify(requestMessage),
      });
      console.log('[웹소켓] 상담 시작 요청 전송:', requestMessage);
      return true;
    } catch (error) {
      console.error('[웹소켓] 상담 시작 요청 전송 실패:', error);
      return false;
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
        role: 'ROLE_USER',
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

  // 상담사가 입장 요청을 수락하는 메서드 (최종 수정)
  sendAcceptRequest(counselorCode, userId) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 요청을 보낼 수 없습니다.');
      return false;
    }

    try {
      // 명세에 정확히 맞게 메시지 구조 수정
      const responseMessage = {
        event: 'accepted',
        user: userId,
        channel: counselorCode,
        role: 'ROLE_COUNSELOR',
      };

      // JSON 문자열로 변환하여 로그 출력
      const messageString = JSON.stringify(responseMessage, null, 2);
      console.log(
        `[웹소켓] 상담사 수락 메시지 전송: /pub/${counselorCode}\n${messageString}`,
      );

      // /pub/{channel_id} 형식 - 백엔드 명세에 맞게 정확히 설정
      this.stompClient.publish({
        destination: `/pub/${counselorCode}`,
        body: JSON.stringify(responseMessage),
      });

      return true;
    } catch (error) {
      console.error('[웹소켓] 입장 요청 수락 실패:', error);
      return false;
    }
  }

  // 상담사가 입장 요청을 거절하는 메서드 (최종 수정)
  sendDeclineRequest(counselorCode, userId) {
    if (!this.stompClient || !this.isConnected) {
      console.error('[웹소켓] 연결되어 있지 않아 요청을 보낼 수 없습니다.');
      return false;
    }

    try {
      // 명세에 정확히 맞게 메시지 구조 수정
      const responseMessage = {
        event: 'declined',
        user: userId,
        channel: counselorCode,
        role: 'ROLE_COUNSELOR',
      };

      // JSON 문자열로 변환하여 로그 출력
      const messageString = JSON.stringify(responseMessage, null, 2);
      console.log(
        `[웹소켓] 상담사 거절 메시지 전송: /pub/${counselorCode}\n${messageString}`,
      );

      // /pub/{channel_id} 형식 - 백엔드 명세에 맞게 정확히 설정
      this.stompClient.publish({
        destination: `/pub/${counselorCode}`,
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
