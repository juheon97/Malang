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
public class VoiceChannelResponse {

    private String channelId;
    private String channelName;
    private int maxPlayer;
    private boolean hasPassword; // 비밀번호 유무만 표시 (보안)
    private String description;
    private Long creatorId;
    private String creatorNickname;
    private LocalDateTime createdAt;
    private Integer category;

    // Channel 엔티티로부터 DTO 생성하는 정적 팩토리 메서드
    public static VoiceChannelResponse from(Channel channel, String creatorNickname) {
        return VoiceChannelResponse.builder()
                .channelId(channel.getChannelId())
                .channelName(channel.getChannelName())
                .maxPlayer(channel.getMaxPlayer())
                .hasPassword(channel.getPassword() != null && !channel.getPassword().isEmpty())
                .description(channel.getDescription())
                .creatorId(channel.getUserId())
                .creatorNickname(creatorNickname)
                .createdAt(channel.getCreatedAt())
                .category(channel.getCategory())
                .build();
    }
}