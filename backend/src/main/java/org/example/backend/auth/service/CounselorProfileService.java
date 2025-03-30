package org.example.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.dto.request.CounselorProfileUpdateRequest;
import org.example.backend.auth.dto.response.CounselorProfileResponse;
import org.example.backend.auth.event.CounselorProfileUpdatedEvent;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorProfileRepository;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 상담사 프로필 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CounselorProfileService {

    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;
    private final CounselorProfileRepository counselorProfileRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 상담사 프로필 조회
     * @param userId 사용자 ID
     * @return 상담사 프로필 응답 객체
     */
    @Transactional(readOnly = true)
    public CounselorProfileResponse getCounselorProfile(Long userId) {
        log.info("상담사 프로필 조회 요청: userId={}", userId);

        // 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 상담사 정보 조회
        Counselor counselor = counselorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

        // 상담사 프로필 정보 조회
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));

        log.info("상담사 프로필 조회 성공: userId={}", userId);
        // 응답 DTO 생성 및 반환
        return CounselorProfileResponse.from(user, counselor, profile);
    }

    /**
     * 상담사 프로필 업데이트
     * @param userId 사용자 ID
     * @param request 업데이트 요청 객체
     * @return 업데이트된 상담사 프로필 응답 객체
     */
    @Transactional
    public CounselorProfileResponse updateCounselorProfile(Long userId, CounselorProfileUpdateRequest request) {
        log.info("상담사 프로필 업데이트 요청: userId={}", userId);

        // 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 상담사 정보 조회
        Counselor counselor = counselorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

        // 상담사 프로필 정보 조회
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));

        // 사용자 정보 업데이트
        if (request.getNickname() != null || request.getProfileUrl() != null) {
            // 현재 값 유지 또는 새 값으로 업데이트
            String profileUrl = (request.getProfileUrl() != null)
                    ? request.getProfileUrl()
                    : user.getProfileUrl();

            String nickname = (request.getNickname() != null)
                    ? request.getNickname()
                    : user.getNickname();

            user.updateProfile(profileUrl, nickname);
        }

        // 상담사 프로필 정보 업데이트
        updateProfileFields(profile, request);

        // 변경사항 저장
        userRepository.save(user);
        counselorProfileRepository.save(profile);

        // 프로필 업데이트 이벤트 발행
        eventPublisher.publishEvent(new CounselorProfileUpdatedEvent(this, userId, counselor.getId()));
        log.info("상담사 프로필 업데이트 이벤트 발행: userId={}, counselorId={}", userId, counselor.getId());

        log.info("상담사 프로필 업데이트 성공: userId={}", userId);
        // 업데이트된 정보로 응답 생성
        return CounselorProfileResponse.from(user, counselor, profile);
    }

    /**
     * 자격증 정보만 업데이트
     * @param userId 사용자 ID
     * @param hasCertification 자격증 보유 여부
     * @return 업데이트된 상담사 프로필 응답 객체
     */
    @Transactional
    public CounselorProfileResponse updateCertification(Long userId, Boolean hasCertification) {
        log.info("상담사 자격증 정보 업데이트 요청: userId={}, hasCertification={}", userId, hasCertification);

        // 상담사 프로필 정보 조회
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));

        // 상담사 정보 조회
        Counselor counselor = counselorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

        // 자격증 정보 업데이트
        String certificationValue = hasCertification ? "Y" : "N";
        profile.updateProfile(profile.getSpecialty(), profile.getYears(), certificationValue, profile.getBio());
        counselorProfileRepository.save(profile);

        // 프로필 업데이트 이벤트 발행
        eventPublisher.publishEvent(new CounselorProfileUpdatedEvent(this, userId, counselor.getId()));
        log.info("상담사 자격증 정보 업데이트 이벤트 발행: userId={}, counselorId={}", userId, counselor.getId());

        log.info("상담사 자격증 정보 업데이트 성공: userId={}", userId);
        // 업데이트된 전체 프로필 조회 및 반환
        return getCounselorProfile(userId);
    }

    /**
     * 프로필 필드 업데이트 헬퍼 메서드
     * @param profile 업데이트할 프로필 엔티티
     * @param request 업데이트 요청 객체
     */
    private void updateProfileFields(CounselorProfile profile, CounselorProfileUpdateRequest request) {
        String specialty = request.getSpecialty() != null ? request.getSpecialty() : profile.getSpecialty();
        String years = request.getYears() != null ? request.getYears() : profile.getYears();

        String certifications = profile.getCertifications();
        if (request.getHasCertification() != null) {
            certifications = request.getCertificationString();
        }

        String bio = request.getBio() != null ? request.getBio() : profile.getBio();

        profile.updateProfile(specialty, years, certifications, bio);
    }
}