package org.example.backend.auth.repository;

import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 상담사 정보 접근을 위한 Repository 인터페이스
 */
public interface CounselorRepository extends JpaRepository<Counselor, Long> {

    /**
     * 사용자로 상담사 조회
     *
     * @param user 사용자 정보
     * @return 상담사 정보
     */
    Optional<Counselor> findByUser(User user);

    /**
     * 사용자 ID로 상담사 조회
     *
     * @param userId 사용자 ID
     * @return 상담사 정보
     */
    @Query("SELECT c FROM Counselor c WHERE c.user.id = :userId")
    Optional<Counselor> findByUserId(@Param("userId") Long userId);

    /**
     * 모든 상담사 목록 조회
     *
     * @param pageable 페이징 정보
     * @return 상담사 목록
     */
    @Override
    Page<Counselor> findAll(Pageable pageable);
}