package org.example.backend.auth.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.dto.request.CounselorProfileUpdateRequest;
import org.example.backend.auth.dto.response.CounselorProfileResponse;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorProfileRepository;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.auth.service.CounselorProfileService;
import org.example.backend.security.jwt.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 상담사 프로필 관련 API 엔드포인트를 제공하는 컨트롤러
 */
@RestController
@RequestMapping("/counselor/profile")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "상담사프로필", description = "상담사 프로필 컨트롤러")
public class CounselorProfileController {

    private final CounselorProfileService counselorProfileService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final CounselorProfileRepository counselorProfileRepository;
    private final CounselorRepository counselorRepository;

    /**
     * 상담사 프로필 조회 API
     * @return 상담사 프로필 정보
     */
    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            // 현재 인증된 사용자 ID 추출
            Long userId = getCurrentUserId();
            log.info("상담사 프로필 조회 API 호출: userId={}", userId);

            // 서비스 호출
            CounselorProfileResponse response = counselorProfileService.getCounselorProfile(userId);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("상담사 프로필 조회 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("상담사 프로필 조회 중 예외 발생: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "프로필 조회 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 상담사 프로필 업데이트 API
     * @param request 업데이트 요청 객체
     * @return 업데이트된 상담사 프로필 정보
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody CounselorProfileUpdateRequest request) {
        try {
            // 현재 인증된 사용자 ID 추출
            Long userId = getCurrentUserId();
            log.info("상담사 프로필 업데이트 API 호출: userId={}", userId);

            // 서비스 호출
            CounselorProfileResponse response = counselorProfileService.updateCounselorProfile(userId, request);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("상담사 프로필 업데이트 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("상담사 프로필 업데이트 중 예외 발생: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "프로필 업데이트 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 상담사 자격증 정보 업데이트 API
     * @param hasCertification 자격증 보유 여부
     * @return 업데이트된 상담사 프로필 정보
     */
    @PutMapping("/certification")
    public ResponseEntity<?> updateCertification(@RequestParam Boolean hasCertification) {
        try {
            // 현재 인증된 사용자 ID 추출
            Long userId = getCurrentUserId();
            log.info("상담사 자격증 정보 업데이트 API 호출: userId={}, hasCertification={}", userId, hasCertification);

            // 서비스 호출
            CounselorProfileResponse response = counselorProfileService.updateCertification(userId, hasCertification);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("상담사 자격증 정보 업데이트 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("상담사 자격증 정보 업데이트 중 예외 발생: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "자격증 정보 업데이트 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 현재 인증된 사용자의 ID를 추출하는 헬퍼 메서드
     * @return 현재 로그인된 사용자의 ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }

        // UserDetails를 통한 방법
        if (authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();

            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("사용자 정보를 찾을 수 없습니다."));
        }

        // JWT 토큰을 통한 방법 (헤더에서 토큰을 추출하는 경우)
        if (authentication.getCredentials() instanceof String) {
            String token = (String) authentication.getCredentials();
            return jwtTokenProvider.getUserIdFromToken(token);
        }

        throw new IllegalStateException("인증 정보에서 사용자 ID를 추출할 수 없습니다.");
    }

    @PutMapping("/1")
    public ResponseEntity<?> updateStatusIntoOne() {
        try {
            Long userId = getCurrentUserId();
            log.info("상담사 busy 상태로 변경: userId={}", userId);

            CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));

            profile.updateStatus(1); // 1: 상담 중/불가능 상태로 직접 설정
            counselorProfileRepository.save(profile);

            return ResponseEntity.ok().build(); // 간단히 성공 응답만 반환
        } catch (Exception e) {
            log.error("상태 변경 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/0")
    public ResponseEntity<?> updateStatusIntoZero() {
        try {
            Long userId = getCurrentUserId();
            log.info("상담사 busy 상태로 변경: userId={}", userId);

            CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));

            profile.updateStatus(0); // 1: 상담 중/불가능 상태로 직접 설정
            counselorProfileRepository.save(profile);

            return ResponseEntity.ok().build(); // 간단히 성공 응답만 반환
        } catch (Exception e) {
            log.error("상태 변경 실패: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    public Long getCounselorId(Long userId) {
        return counselorRepository.findByUserId(userId)
                .map(Counselor::getId)
                .orElse(null);
    }
}