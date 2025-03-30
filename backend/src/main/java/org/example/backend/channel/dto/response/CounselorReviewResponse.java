package org.example.backend.channel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 상담사 리뷰 조회 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorReviewResponse {
    private Integer id;              // 리뷰 ID
    private Long userId;             // 작성자 ID
    private String userName;         // 작성자 이름
    private Integer score;           // 평점 (1-5)
    private String content;          // 리뷰 내용
    private LocalDateTime createdAt; // 작성일
}