package org.example.backend.websocket.dto.response;

public record ChannelEventResponse(Long channel, Long user_id, String event) {
}