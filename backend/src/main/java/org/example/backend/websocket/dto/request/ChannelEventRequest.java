package org.example.backend.websocket.dto.request;



public record ChannelEventRequest(String event, Long user_id, Long channel, String role ) {
}
