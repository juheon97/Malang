package org.example.backend.channel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.backend.channel.model.Channel;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingChannelResponse {

    private String channelId;
    private String channelName;
    private int maxPlayer;
    private String channelType; // "NORMAL" 또는 "GROUP"
    private String description;
    private Long counselorId;
    private String counselorNickname;
    private LocalDateTime createdAt;

    // Channel 엔티티로부터 DTO 생성하는 정적 팩토리 메서드
    public static CounselingChannelResponse from(Channel channel, String counselorNickname) {
        String channelType = channel.getMaxPlayer() == 1 ? "NORMAL" : "GROUP";

        return CounselingChannelResponse.builder()
                .channelId(channel.getChannelId())
                .channelName(channel.getChannelName())
                .maxPlayer(channel.getMaxPlayer())
                .channelType(channelType)
                .description(channel.getDescription())
                .counselorId(channel.getUserId())
                .counselorNickname(counselorNickname)
                .createdAt(channel.getCreatedAt())
                .build();
    }
}