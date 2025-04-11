package org.example.backend.websocket.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    private static final Logger logger = LoggerFactory.getLogger(ChatWsController.class);

    public ChatWsController(ChatWsService chatWsService) {
        this.chatWsService = chatWsService;
    }

    @MessageMapping("/{channel_id}/chat")
    @SendTo("/sub/{channel_id}")
    public ChatMessageResponse handleMessage(
            @DestinationVariable Long channel_id,
            ChatMessageRequest request) {

        logger.info("Received chat message: channel_id={}, event={}, content_length={}, user={}, nickname={}",
                channel_id, request.event(), request.content() != null ? request.content().length() : 0, request.userId(), request.nickname());


        String processedContent = chatWsService.processMessage(request.event(), request.content(), request.userId(), request.nickname());

        if ("send".equals(request.event())) {
            logger.info("Sent message to channel {}", channel_id);
            return new ChatMessageResponse("message", processedContent, request.userId(), request.nickname());
        } else {
            logger.warn("Chat error for channel {}: {}", channel_id, processedContent);
            return new ChatMessageResponse("message", processedContent, request.userId(), request.nickname());
        }
    }
}