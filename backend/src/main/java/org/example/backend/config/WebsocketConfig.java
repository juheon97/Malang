package org.example.backend.config;

import org.example.backend.security.jwt.JwtTokenProvider;  // 제공하신 JWT 클래스
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    public WebsocketConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/sub"); // 구독(subscribe) 요청을 처리할 prefix 설정, 클라이언트가 "/sub/..."로 시작하는 주제를 구독할 수 있음
        registry.setApplicationDestinationPrefixes("/pub"); // 발행(publish)클라이언트에서 서버로 메시지를 발행할 때 사용할 prefix 설정, 클라이언트가 "/pub/..."로 메시지를 보내면 @MessageMapping이 처리함
    }


    // 클라이언트가 WebSocket 연결을 맺기 위한 경로를 설정
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws") // WebSocket 연결 엔드포인트 경로 설정 ("/ws")
                .setAllowedOriginPatterns("http://localhost:5173", "https://j12d110.p.ssafy.io", "https://*.ngrok-free.app")
                .withSockJS();


    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authorizationHeader != null) {
                        String token = jwtTokenProvider.resolveToken(authorizationHeader);

                        if (token != null && jwtTokenProvider.validateToken(token)) {
                            // 토큰에서 사용자 정보 추출
                            String email = jwtTokenProvider.getEmailFromToken(token);
                            Long userId = jwtTokenProvider.getUserIdFromToken(token);
                            String auth = jwtTokenProvider.getAuthFromToken(token);

                            // 사용자 정보를 웹소켓 세션에 저장
                            accessor.setUser(() -> email);

                            // 추가 정보 저장 (필요한 경우)
                            accessor.getSessionAttributes().put("userId", userId);
                            accessor.getSessionAttributes().put("auth", auth);
                        }
                    }
                }
                return message;
            }
        });
    }
}
