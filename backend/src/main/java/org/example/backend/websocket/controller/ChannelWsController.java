package org.example.backend.websocket.controller;

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

    public ChannelWsController(ChannelWsService channelWsService) {
        this.channelWsService = channelWsService;
    }

    @MessageMapping("/{channel_id}/")
    @SendTo("/sub/{channel_id}/")
    public ChannelEventResponse handleChannel(
            @DestinationVariable Long channel_id,
            ChannelEventRequest request) {

        switch (request.event()) {
            case "join":
                channelWsService.joinChannel(channel_id, request.user_id());
                return new ChannelEventResponse(channel_id, request.user_id(), "join");

            case "leave":
                channelWsService.leaveChannel(channel_id, request.user_id());
                return new ChannelEventResponse(channel_id, request.user_id(), "leave");

            default:
                return new ChannelEventResponse(channel_id, request.user_id(), "unknown");
        }
    }
}