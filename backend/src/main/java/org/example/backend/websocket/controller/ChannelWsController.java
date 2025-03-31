package org.example.backend.websocket.controller;

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

    private static final Logger logger = LoggerFactory.getLogger(ChannelWsController.class);

    public ChannelWsController(ChannelWsService channelWsService) {
        this.channelWsService = channelWsService;
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
                return new ChannelEventResponse(channel_id, request.user_id(), "page_move", request.role());

            case "declined":
                logger.info("Counselor declined session request from user {} in channel {}", request.user_id(), channel_id);
                return new ChannelEventResponse(channel_id, request.user_id(), "page_stay", request.role());

            default:
                logger.warn("Unknown channel event: {}", request.event());
                return new ChannelEventResponse(channel_id, request.user_id(), "unknown", request.role());
        }
    }
}