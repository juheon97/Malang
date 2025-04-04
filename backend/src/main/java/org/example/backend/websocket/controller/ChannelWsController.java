package org.example.backend.websocket.controller;

import org.example.backend.websocket.service.ChannelChatRecrodService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.example.backend.websocket.dto.request.ChannelEventRequest;
import org.example.backend.websocket.dto.response.ChannelEventResponse;
import org.example.backend.websocket.service.ChannelWsService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChannelWsController {

    private final ChannelWsService channelWsService;
    private final ChannelChatRecrodService channelChatRecrodService;

    private static final Logger logger = LoggerFactory.getLogger(ChannelWsController.class);

    public ChannelWsController(ChannelWsService channelWsService, ChannelChatRecrodService channelChatRecrodService) {
        this.channelWsService = channelWsService;
        this.channelChatRecrodService = channelChatRecrodService;
    }

    @MessageMapping("/{channel_id}")
    @SendTo("/sub/{channel_id}")
    public ChannelEventResponse handleChannel(
            @DestinationVariable Long channel_id,
            ChannelEventRequest request) {

        logger.info("Received channel event: channel_id={}, user_id={}, event={}, full request={}",
                channel_id, request.user_id(), request.event(), request);

        logger.debug("Received channel event: channel_id={}, user_id={}, event={}",
                channel_id, request.user_id(), request.event());


        switch (request.event()) {
            case "join":
                channelWsService.joinChannel(channel_id, request.user_id());
                logger.info("User {} joined channel {}", request.user_id(), channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "join", request.role());

            case "leave":
                channelWsService.leaveChannel(channel_id, request.user_id());
                logger.info("User {} left channel {}", request.user_id(), channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "leave", request.role());

            case "accepted":
                logger.info("Counselor accepted session request from user {} in channel {}", request.user_id(), channel_id);
                channelWsService.UserCounselorJoin(request.user_id(), request.channel());
                return new ChannelEventResponse(channel_id, request.user_id(), "page_move", request.role());

            case "declined":
                logger.info("Counselor declined session request from user {} in channel {}", request.user_id(), channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "page_stay", request.role());

            case "con_leave":
                logger.info("Counselor leaved session request from user {} in channel {}", request.user_id(), channel_id);
                channelWsService.counselStatusChange(request.user_id());
                channelWsService.CounselorLeave(channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "con_leaved", request.role());

            case "start":
                logger.info("Counselor started conversation request from user {} in channel {}", request.user_id(), channel_id);
                // 상담 시작 시 채팅 요약 초기화
                channelChatRecrodService.initializeChatSummary(channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "started", request.role());

            case "end":
                logger.info("Counselor ended conversation request from user {} in channel {}", request.user_id(), channel_id);
                channelWsService.sendSummaryRequest(channel_id, request.user_id());
                return new ChannelEventResponse(channel_id, request.user_id(), "ended", request.role());

            case "user_leave":
                logger.info("User leaved counsel session request from user {} in channel {}", request.user_id(), channel_id);
                channelWsService.UserCounselorLeave(request.user_id(), channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "user_leaved", request.role());

            case "con_join":
                logger.info("Cunselor joined session request from user {} in channel {}", request.user_id(), channel_id);
                channelWsService.CounselorJoin(request.user_id(), channel_id);
                return new ChannelEventResponse(null, null, null, null);
            default:
                logger.warn("Unknown channel event: {}", request.event());
                return new ChannelEventResponse(channel_id, request.user_id(), "unknown", request.role());
        }
    }
}