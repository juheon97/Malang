package org.example.backend.auth.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "counselorprofile")
public class CounselorProfile {

    @Id
    @Column(name = "counselor_id", columnDefinition = "CHAR(36)")
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "specialty", length = 36)
    private String specialty;

    @Column(name = "years", length = 36)
    private String years;

    @Column(name = "certifications", length = 6)
    private String certifications;

    @Column(name = "bio")
    private String bio;

    @Column(name = "rating_avg")
    private Double ratingAvg;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "status")
    private Integer status;

    @Builder
    public CounselorProfile(String id, User user, String specialty, String years,
                            String certifications, String bio, Double ratingAvg,
                            Integer reviewCount, Integer status) {
        this.id = id;
        this.user = user;
        this.specialty = specialty;
        this.years = years;
        this.certifications = certifications;
        this.bio = bio;
        this.ratingAvg = ratingAvg;
        this.reviewCount = reviewCount;
        this.status = status != null ? status : 0; // 기본값 0 설정
    }

    /**
     * 프로필 정보 업데이트
     * @param specialty 전문 분야
     * @param years 경력
     * @param certifications 자격증 여부 (Y/N)
     * @param bio 자기소개
     */
    public void updateProfile(String specialty, String years, String certifications, String bio) {
        if (specialty != null) {
            this.specialty = specialty;
        }
        if (years != null) {
            this.years = years;
        }
        if (certifications != null) {
            this.certifications = certifications;
        }
        if (bio != null) {
            this.bio = bio;
        }
    }

    /**
     * 상담사 상태 업데이트
     * @param status 상태 (0: 대기/가능, 1: 상담 중/불가능)
     */
    public void updateStatus(Integer status) {
        this.status = status;
    }
}