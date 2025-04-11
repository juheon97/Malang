package org.example.backend.websocket.dto.request;

public record ChannelEventRequest(String event, Long user, Long channel, String role ) {
}
