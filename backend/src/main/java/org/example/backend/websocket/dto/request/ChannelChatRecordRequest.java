package org.example.backend.websocket.dto.request;

import java.time.LocalDateTime;

public record ChannelChatRecordRequest(String event, String content,Long channel, Long user, String nickname, LocalDateTime currentTime,  String role){

}
