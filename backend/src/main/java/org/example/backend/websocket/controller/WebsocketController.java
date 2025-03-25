package org.example.backend.websocket.controller;

import org.example.backend.websocket.dto.request.ChatMessageRequest;
import org.example.backend.websocket.dto.response.ChatMessageResponse;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;


@Controller
public class WebsocketController {
    @MessageMapping("/chat")
    @SendTo("/sub/chat")
    public ChatMessageResponse handleMessage(ChatMessageRequest request) {
        // 이벤트 타입에 따라 다른 처리를 할 수 있음
        switch (request.event()) {
            case "send":
                return new ChatMessageResponse("message", request.content());
            default:
                return new ChatMessageResponse("error", "Unknown event");
        }
    }
}