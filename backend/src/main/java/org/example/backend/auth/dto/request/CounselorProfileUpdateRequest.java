package org.example.backend.auth.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 상담사 프로필 업데이트 요청 DTO
 * 수정할 필드만 포함하여 부분 업데이트 지원
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CounselorProfileUpdateRequest {

    // User 엔티티 관련 필드
    @Size(min = 2, max = 20, message = "닉네임은 2~20자 사이어야 합니다.")
    private String nickname;

    private String profileUrl;

    // CounselorProfile 엔티티 관련 필드
    @Size(max = 36, message = "전문 분야는 최대 36자까지 가능합니다.")
    private String specialty;

    @Size(max = 36, message = "경력은 최대 36자까지 가능합니다.")
    private String years;

    private Boolean hasCertification;

    @Size(max = 500, message = "자기소개는 최대 500자까지 가능합니다.")
    private String bio;

    /**
     * 자격증 정보를 엔티티 저장용 문자열로 변환
     * @return "Y" 또는 "N" 문자열
     */
    public String getCertificationString() {
        if (this.hasCertification == null) {
            return null;
        }
        return this.hasCertification ? "Y" : "N";
    }
}