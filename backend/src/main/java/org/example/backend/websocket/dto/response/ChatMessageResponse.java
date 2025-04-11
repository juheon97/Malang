package org.example.backend.websocket.dto.response;

public record ChatMessageResponse(String event, String content, Long userId, String nickname) {
}
