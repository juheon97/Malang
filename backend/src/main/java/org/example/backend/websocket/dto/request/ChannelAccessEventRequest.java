package org.example.backend.websocket.dto.request;

public record ChannelAccessEventRequest(String event, String name, String birth, Long user, Long channel, String role) {
}
