package org.example.backend.websocket.dto.request;

public record ChatMessageRequest (String event, String content) {
}
