package org.example.backend.auth.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.User;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 상담사 프로필 정보 응답 DTO
 * User, Counselor, CounselorProfile 엔티티의 정보를 통합
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CounselorProfileResponse {
    // User 엔티티 관련 필드
    private Long userId;
    private String email;
    private String nickname;
    private String profileUrl;

    // Counselor 엔티티 관련 필드
    private Long counselorId;
    private String name;
    private String gender;
    private LocalDateTime birthdate;
    private String formattedBirthdate; // UI 표시용 포맷팅된 생년월일

    // CounselorProfile 엔티티 관련 필드
    private String specialty;
    private String years;
    private String certifications;
    private Boolean hasCertification; // UI 표시용 Boolean 변환
    private String bio;
    private Double ratingAvg;
    private Integer reviewCount;
    private Integer status;

    /**
     * 엔티티에서 DTO로 변환하는 정적 팩토리 메서드
     * @param user User 엔티티
     * @param counselor Counselor 엔티티
     * @param profile CounselorProfile 엔티티
     * @return 통합된 CounselorProfileResponse 객체
     */
    public static CounselorProfileResponse from(User user, Counselor counselor, CounselorProfile profile) {
        CounselorProfileResponse response = new CounselorProfileResponse();

        // User 정보 매핑
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setNickname(user.getNickname());
        response.setProfileUrl(user.getProfileUrl());

        // Counselor 정보 매핑
        response.setCounselorId(counselor.getId());
        response.setName(counselor.getName());
        response.setGender(counselor.getGender());
        response.setBirthdate(counselor.getBirthdate());

        // 생년월일 포맷팅 (YYYY-MM-DD 형식)
        if (counselor.getBirthdate() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            response.setFormattedBirthdate(counselor.getBirthdate().format(formatter));
        }

        // CounselorProfile 정보 매핑 (null 체크 포함)
        if (profile != null) {
            response.setSpecialty(profile.getSpecialty());
            response.setYears(profile.getYears());
            response.setCertifications(profile.getCertifications());

            // 자격증 정보 Boolean 변환 (Y/N -> true/false)
            if (profile.getCertifications() != null) {
                response.setHasCertification("Y".equals(profile.getCertifications()));
            }

            response.setBio(profile.getBio());
            response.setRatingAvg(profile.getRatingAvg());
            response.setReviewCount(profile.getReviewCount());
            response.setStatus(profile.getStatus());
        }

        return response;
    }
}