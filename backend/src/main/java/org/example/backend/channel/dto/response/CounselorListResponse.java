package org.example.backend.channel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 상담사 목록 조회 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorListResponse {
    private String id;               // 상담사 ID
    private String name;             // 상담사 이름
    private String profileImage;     // 프로필 이미지 URL
    private String title;            // 직함 (예: "심리 상담 전문가")
    private String[] specialties;    // 전문 분야 목록
    private int experience;          // 경력 (년)
    private String[] certifications; // 자격증 목록
    private int satisfactionRate;    // 만족도 비율 (0-100)
    private int reviewCount;         // 리뷰 수
    private String shortIntro;       // 짧은 소개
    private Integer status;          // 상담사 상태 (0: 대기/가능, 1: 상담 중/불가능)
}