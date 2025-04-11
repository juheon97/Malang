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

        logger.info("Received channel access event: channel_id={}, userId={}, event={}, name={}, role={}, birth={}",
                channel_id, request.user(), request.event(), request.name(), request.role(), request.birth());

        if ("join_con".equals(request.event())) {
            logger.info("User {} requested to join counseling session in channel {}", request.user(), channel_id);

            // 요청 정보를 그대로 응답에 포함시키고 role 정보 추가
            return new ChannelAccessEventResponse(
                    request.event(),
                    request.name(),
                    request.birth(),
                    request.user(),
                    request.channel(),
                    request.role()  // 요청에 맞게 role 설정
            );
        } else {
            logger.warn("Unknown channel access event: {}", request.event());
            return new ChannelAccessEventResponse(
                    "error",
                    request.name(),
                    request.birth(),
                    request.user(),
                    request.channel(),
                    "UNKNOWN"
            );
        }
    }
}
