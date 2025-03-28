package org.example.backend.channel.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.backend.common.entity.BaseTimeEntity;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "channel")
public class Channel extends BaseTimeEntity {

    @Id
    @Column(name = "channel_id", columnDefinition = "CHAR(36)")
    private String channelId;

    @Column(name = "channel_name", length = 20, nullable = false)
    private String channelName;

    @Column(name = "max_player", nullable = false)
    private int maxPlayer;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category", nullable = false)
    private int category; // ChannelType을 숫자로 저장 (0: VOICE, 1: COUNSELING)

    @Column(name = "counselor_id", columnDefinition = "CHAR(36)", nullable = true)
    private String counselorId; // 음성 채널은 null 허용

    @Column(name = "password")
    private String password;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private Integer status; // 채널 상태: 0-대기중, 1-진행중, 2-종료됨

    @Column(name = "participants_count")
    private Integer participantsCount; // 현재 참여 인원 수

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime; // 예약된 상담 시간

    // ChannelType은 DB에 저장되지 않는 필드로, category와 매핑하여 사용
    @Transient
    private ChannelType channelType;

    // DB에서 조회 후 ChannelType 설정을 위한 메서드
    @PostLoad
    private void fillChannelType() {
        if (this.category == 0) {
            this.channelType = ChannelType.VOICE;
        } else if (this.category == 1) {
            this.channelType = ChannelType.COUNSELING;
        }
    }

    @Builder
    public Channel(String channelId, String channelName, int maxPlayer, Long userId,
                   String counselorId, ChannelType channelType, String password, String description) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.maxPlayer = maxPlayer;
        this.userId = userId;
        this.counselorId = counselorId;
        this.channelType = channelType;
        this.category = channelType == ChannelType.VOICE ? 0 : 1;
        this.password = password;
        this.description = description;
        this.status = status != null ? status : 0; // 기본값: 대기중
        this.participantsCount = participantsCount != null ? participantsCount : 0; // 기본값: 0명
        this.scheduledTime = scheduledTime;
    }

    // 채널 정보 업데이트 메서드
    public void update(String channelName, int maxPlayer, String password, String description) {
        if (channelName != null) this.channelName = channelName;
        if (maxPlayer > 0) this.maxPlayer = maxPlayer;
        this.password = password; // null 허용
        this.description = description; // null 허용
    }

    // 채널 상태 업데이트 메서드
    public void updateStatus(Integer status) {
        this.status = status;
    }

    // 참여자 수 증가 메서드
    public void incrementParticipants() {
        this.participantsCount++;
    }

    // 참여자 수 감소 메서드
    public void decrementParticipants() {
        if (this.participantsCount > 0) {
            this.participantsCount--;
        }
    }

    // 상담 시간 예약 메서드
    public void scheduleSession(LocalDateTime time) {
        this.scheduledTime = time;
    }
}