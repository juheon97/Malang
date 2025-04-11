package org.example.backend.websocket.dto.response;

public record ChannelChatRecordResponse(String event, String content, Long user, String nickname, String role) {

}
