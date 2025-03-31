package org.example.backend.websocket.dto.response;

public record ChannelAccessEventResponse(String Event, String name, String birth, Long userId, Long channelId, String role) {
}
