package org.example.backend.websocket.controller;

import org.example.backend.websocket.dto.request.ChannelChatRecordRequest;
import org.example.backend.websocket.dto.response.ChannelChatRecordResponse;
import org.example.backend.websocket.service.ChannelChatRecrodService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChannelChatRecordController {

    private static final Logger logger = LoggerFactory.getLogger(ChannelWsController.class);
    private final ChannelChatRecrodService channelChatRecrodService;

    public ChannelChatRecordController(ChannelChatRecrodService channelChatRecrodService) {
        this.channelChatRecrodService = channelChatRecrodService;
    }


    @MessageMapping("/{channel_id}/chat_recd")
    @SendTo("/sub/{channel_id}")
    public ChannelChatRecordResponse handleCounselorChat(
            @DestinationVariable Long channel_id,
            ChannelChatRecordRequest request) {

        logger.info("Received channel chat record: channel_id={}, user_id={}, event={}, nickname={},currentTime={}, role={}, content={}",
                channel_id, request.user(), request.event(), request.nickname(), request.currentTime(), request.role(), request.content());

        logger.debug("Received channel chat record: channel_id={}, user_id={}, event={}",
                channel_id, request.user(), request.event());

        switch (request.event()) {
            case "record_send":
                logger.info("Chat record sent from user {} in channel {}", request.user(), channel_id);
                // 메시지를 채팅 요약에 추가
                channelChatRecrodService.addMessageToSummary(channel_id, request.role(), request.content(),request.currentTime());
                return new ChannelChatRecordResponse("record_sent", request.content(), request.user(), request.nickname(), request.role());

            default:
                logger.warn("Unknown chat record event: {}", request.event());
                return new ChannelChatRecordResponse("unknown", request.content(), request.user(), request.nickname(), request.role());
        }
    }


}
