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

        logger.info("Received channel event: channel_id={}, user={}, event={}, full request={}",
                channel_id, request.user(), request.event(), request);

        logger.debug("Received channel event: channel_id={}, user={}, event={}",
                channel_id, request.user(), request.event());


        switch (request.event()) {
            case "join":
                channelWsService.joinChannel(channel_id, request.user());
                logger.info("User {} joined channel {}", request.user(), channel_id);
                return new ChannelEventResponse(channel_id, request.user(), "join", request.role());

            case "leave":
                channelWsService.leaveChannel(channel_id, request.user());
                logger.info("User {} left channel {}", request.user(), channel_id);
                return new ChannelEventResponse(channel_id, request.user(), "leave", request.role());

            case "accepted":
                logger.info("Counselor accepted session request from user {} in channel {}", request.user(), channel_id);
                channelWsService.UserCounselorJoin(request.user(), request.channel());
                return new ChannelEventResponse(channel_id, request.user(), "page_move", request.role());

            case "declined":
                logger.info("Counselor declined session request from user {} in channel {}", request.user(), channel_id);
                return new ChannelEventResponse(channel_id, request.user(), "page_stay", request.role());

            case "con_leave":
                logger.info("Counselor leaved session request from user {} in channel {}", request.user(), channel_id);
                channelWsService.counselStatusChange(request.user());
                channelWsService.CounselorLeave(channel_id);
                return new ChannelEventResponse(channel_id, request.user(), "con_leaved", request.role());

            case "start":
                logger.info("Counselor started conversation request from user {} in channel {}", request.user(), channel_id);
                // 상담 시작 시 채팅 요약 초기화
                channelChatRecrodService.initializeChatSummary(channel_id);
                return new ChannelEventResponse(channel_id, request.user(), "started", request.role());

            case "end":
                logger.info("Counselor ended conversation request from user {} in channel {}", request.user(), channel_id);
                channelWsService.sendSummaryRequest(channel_id, request.user());
                return new ChannelEventResponse(channel_id, request.user(), "ended", request.role());

            case "user_leave":
                logger.info("User leaved counsel session request from user {} in channel {}", request.user(), channel_id);
                channelWsService.UserCounselorLeave(request.user(), channel_id);
                return new ChannelEventResponse(channel_id, request.user(), "user_leaved", request.role());

            case "con_join":
                logger.info("Cunselor joined session request from user {} in channel {}", request.user(), channel_id);
                channelWsService.CounselorJoin(request.user(), channel_id);
                return new ChannelEventResponse(null, null, null, null);
            default:
                logger.warn("Unknown channel event: {}", request.event());
                return new ChannelEventResponse(channel_id, request.user(), "unknown", request.role());
        }
    }
}