package org.example.backend.websocket.dto.request;

public record ChannelAccessEventRequest(String Event, String name, String birth, Long userId, Long channelId, String role) {
}
