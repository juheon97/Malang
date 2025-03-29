package org.example.backend.websocket.controller;

import org.example.backend.websocket.dto.request.ChatMessageRequest;
import org.example.backend.websocket.dto.response.ChatMessageResponse;
import org.example.backend.websocket.service.ChatWsService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWsController {

    private final ChatWsService chatWsService;

    public ChatWsController(ChatWsService chatWsService) {
        this.chatWsService = chatWsService;
    }

    @MessageMapping("/{channel_id}/chat")
    @SendTo("/sub/{channel_id}/")
    public ChatMessageResponse handleMessage(
            @DestinationVariable Long channel_id,
            ChatMessageRequest request) {

        String processedContent = chatWsService.processMessage(request.event(), request.content());

        if ("send".equals(request.event())) {
            return new ChatMessageResponse("message", processedContent);
        } else {
            return new ChatMessageResponse("error", processedContent);
        }
    }
}