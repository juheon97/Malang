package org.example.backend.channel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * 상담사 상세 정보 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorDetailResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;                // 상담사 ID (String에서 Long으로 변경됨)
    private String name;              // 상담사 이름
    private String gender;            // 성별
    private LocalDate birthDate;      // 생년월일
    private String certifications;    // 자격증 정보
    private String profileImage;      // 프로필 이미지 URL
    private String title;             // 직함 (예: "청소년 상담 분야")
    private String[] specialties;     // 전문 분야 목록
    private int experience;           // 경력 (년)
    private String introduction;      // 자기 소개
    private String[] availableTimes;  // 가능한 상담 시간
    private int satisfactionRate;     // 만족도 비율 (0-100)
    private int reviewCount;          // 리뷰 수
    private Integer status;           // 상담사 상태 (0: 대기/가능, 1: 상담 중/불가능)
}