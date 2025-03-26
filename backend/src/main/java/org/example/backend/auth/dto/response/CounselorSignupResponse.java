package org.example.backend.auth.dto.response;

import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;

import java.time.LocalDateTime;

/**
 * 상담사 회원가입 성공 시 클라이언트에게 반환하는 응답 DTO 클래스
 */
public class CounselorSignupResponse {

    private Long userId;
    private String counselorId;
    private String email;
    private String nickname;
    private String name;
    private String gender;
    private LocalDateTime birthdate;
    private Boolean hasCertification;
    private String message;

    // 기본 생성자
    public CounselorSignupResponse() {
    }

    // 모든 필드를 매개변수로 받는 생성자
    public CounselorSignupResponse(Long userId, String counselorId, String email, String nickname,
                                   String name, String gender, LocalDateTime birthdate,
                                   Boolean hasCertification, String message) {
        this.userId = userId;
        this.counselorId = counselorId;
        this.email = email;
        this.nickname = nickname;
        this.name = name;
        this.gender = gender;
        this.birthdate = birthdate;
        this.hasCertification = hasCertification;
        this.message = message;
    }

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

    // Getter 및 Setter
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCounselorId() {
        return counselorId;
    }

    public void setCounselorId(String counselorId) {
        this.counselorId = counselorId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDateTime getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(LocalDateTime birthdate) {
        this.birthdate = birthdate;
    }

    public Boolean getHasCertification() {
        return hasCertification;
    }

    public void setHasCertification(Boolean hasCertification) {
        this.hasCertification = hasCertification;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}