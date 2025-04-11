package org.example.backend.auth.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * 상담사 프로필 업데이트 시 발행되는 이벤트 클래스
 */
@Getter
public class CounselorProfileUpdatedEvent extends ApplicationEvent {

    private final Long userId;
    private final Long counselorId; // String에서 Long으로 변경

    /**
     * 상담사 프로필 업데이트 이벤트 생성
     *
     * @param source 이벤트 소스
     * @param userId 사용자 ID
     * @param counselorId 상담사 ID
     */
    public CounselorProfileUpdatedEvent(Object source, Long userId, Long counselorId) {
        super(source);
        this.userId = userId;
        this.counselorId = counselorId;
    }
}