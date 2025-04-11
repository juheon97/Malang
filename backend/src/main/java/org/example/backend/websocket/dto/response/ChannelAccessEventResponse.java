package org.example.backend.websocket.dto.response;

public record ChannelAccessEventResponse(String event, String name, String birth, Long user, Long channel, String role) {
}
