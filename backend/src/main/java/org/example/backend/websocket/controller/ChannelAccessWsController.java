package org.example.backend.websocket.controller;

import org.example.backend.websocket.dto.request.ChannelAccessEventRequest;
import org.example.backend.websocket.dto.response.ChannelAccessEventResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChannelAccessWsController {

    private static final Logger logger = LoggerFactory.getLogger(ChannelWsController.class);

    @MessageMapping("/{channel_id}/access")
    @SendTo("/sub/{channel_id}")
    public ChannelAccessEventResponse handleChannelAccess(
            @DestinationVariable Long channel_id,
            ChannelAccessEventRequest request) {

        logger.info("Received channel access event: channel_id={}, userId={}, event={}, name={}, role={}",
                channel_id, request.userId(), request.Event(), request.name(), request.role());

        if ("join_con".equals(request.Event())) {
            logger.info("User {} requested to join counseling session in channel {}", request.userId(), channel_id);

            // 요청 정보를 그대로 응답에 포함시키고 role 정보 추가
            return new ChannelAccessEventResponse(
                    request.Event(),
                    request.name(),
                    request.birth(),
                    request.userId(),
                    request.channelId(),
                    request.role()  // 요청에 맞게 role 설정
            );
        } else {
            logger.warn("Unknown channel access event: {}", request.Event());
            return new ChannelAccessEventResponse(
                    "error",
                    request.name(),
                    request.birth(),
                    request.userId(),
                    request.channelId(),
                    "UNKNOWN"
            );
        }
    }
}
