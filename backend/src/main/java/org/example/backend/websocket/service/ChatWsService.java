package org.example.backend.websocket.service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ChatWsService {

    private static final Logger logger = LoggerFactory.getLogger(ChatWsService.class);

    /**
     * 채팅 메시지를 처리합니다.
     * 필요에 따라 메시지 저장, 필터링 등의 기능을 추가할 수 있습니다.
     */
    public String processMessage(String event, String content) {
        logger.debug("Processing chat message: event={}, content={}", event, content);
        // 이벤트 타입에 따른 처리
        if ("send".equals(event)) {
            // 여기에 메시지 처리 로직 추가 가능
            // 예: 메시지 필터링, DB 저장 등
            logger.info("Chat message processed successfully");
            return content;
        }
        logger.warn("Unknown chat event: {}", event);
        return "Unknown event";
    }
}