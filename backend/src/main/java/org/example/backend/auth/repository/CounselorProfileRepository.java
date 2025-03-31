package org.example.backend.auth.repository;

import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 상담사 프로필 정보 접근을 위한 Repository 인터페이스
 */
public interface CounselorProfileRepository extends JpaRepository<CounselorProfile, Long> {

    /**
     * 사용자 ID로 상담사 프로필 조회
     *
     * @param userId 사용자 ID
     * @return 상담사 프로필
     */
    @Query("SELECT cp FROM CounselorProfile cp WHERE cp.user.id = :userId")
    Optional<CounselorProfile> findByUserId(@Param("userId") Long userId);

    /**
     * 사용자로 상담사 프로필 조회
     *
     * @param user 사용자 정보
     * @return 상담사 프로필
     */
    Optional<CounselorProfile> findByUser(User user);

    /**
     * 특정 전문 분야를 포함하는 프로필 조회
     *
     * @param specialty 전문 분야 키워드
     * @return 전문 분야를 포함하는 프로필 목록
     */
    @Query("SELECT cp FROM CounselorProfile cp WHERE cp.specialty LIKE %:specialty%")
    List<CounselorProfile> findBySpecialtyContaining(@Param("specialty") String specialty);

    /**
     * 특정 경력 이상의 프로필 조회
     *
     * @param yearsValue 최소 경력 (숫자형 문자열)
     * @return 일치하는 프로필 목록
     */
    List<CounselorProfile> findByYearsGreaterThanEqual(String yearsValue);

    /**
     * 특정 상담사 ID로 프로필 조회
     *
     * @param counselorId 상담사 ID
     * @return 상담사 프로필
     */
    @Override
    Optional<CounselorProfile> findById(Long counselorId);
}