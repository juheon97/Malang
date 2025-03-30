package org.example.backend.channel.repository;

import org.example.backend.channel.model.CounselingReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 상담 리뷰 접근을 위한 Repository 인터페이스
 */
public interface CounselingReviewRepository extends JpaRepository<CounselingReview, Integer> {

    /**
     * 특정 상담사의 리뷰 목록 조회
     *
     * @param counselorId 상담사 ID
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    Page<CounselingReview> findByCounselorId(String counselorId, Pageable pageable);

    /**
     * 특정 상담사의 리뷰 수 조회
     *
     * @param counselorId 상담사 ID
     * @return 리뷰 수
     */
    long countByCounselorId(String counselorId);

    /**
     * 특정 상담사의 리뷰 평균 점수 조회
     *
     * @param counselorId 상담사 ID
     * @return 평균 점수 (1-5 사이의 값)
     */
    @Query("SELECT AVG(cr.score) FROM CounselingReview cr WHERE cr.counselorId = :counselorId")
    Double findAverageScoreByCounselorId(@Param("counselorId") String counselorId);
}