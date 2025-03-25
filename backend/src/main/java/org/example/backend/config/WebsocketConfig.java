package org.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/sub"); // 구독(subscribe) 요청을 처리할 prefix 설정, 클라이언트가 "/sub/..."로 시작하는 주제를 구독할 수 있음
        registry.setApplicationDestinationPrefixes("/pub"); // 클라이언트에서 서버로 메시지를 발행할 때 사용할 prefix 설정, 클라이언트가 "/pub/..."로 메시지를 보내면 @MessageMapping이 처리함
    }


    // 클라이언트가 WebSocket 연결을 맺기 위한 경로를 설정
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws") // WebSocket 연결 엔드포인트 경로 설정 ("/ws")
                .setAllowedOrigins("*"); // 모든 도메인에서의 연결을 허용 (CORS 설정), 실제 운영 환경에서는 보안을 위해 특정 도메인만 허용하는 것이 좋음
    }
}
