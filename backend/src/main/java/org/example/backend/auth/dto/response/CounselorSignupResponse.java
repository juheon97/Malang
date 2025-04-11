package org.example.backend.auth.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;

import java.time.LocalDateTime;

/**
 * 상담사 회원가입 성공 시 클라이언트에게 반환하는 응답 DTO 클래스
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CounselorSignupResponse {

    private Long userId;
    private Long counselorId;
    private String email;
    private String nickname;
    private String name;
    private String gender;
    private LocalDateTime birthdate;
    private Boolean hasCertification;
    private String message;

    /**
     * 상담사 및 사용자 엔티티로부터 응답 객체 생성
     *
     * @param counselor 상담사 엔티티
     * @param hasCertification 자격증 여부
     * @param message 성공 메시지
     * @return CounselorSignupResponse 객체
     */
    public static CounselorSignupResponse from(Counselor counselor, Boolean hasCertification, String message) {
        User user = counselor.getUser();
        return new CounselorSignupResponse(
                user.getId(),
                counselor.getId(),
                user.getEmail(),
                user.getNickname(),
                counselor.getName(),
                counselor.getGender(),
                counselor.getBirthdate(),
                hasCertification,
                message
        );
    }
}