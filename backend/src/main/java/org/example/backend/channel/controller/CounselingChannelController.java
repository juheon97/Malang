package org.example.backend.channel.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.Role;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.CounselingChannelCreateRequest;
import org.example.backend.channel.dto.request.CounselingRequestDto;
import org.example.backend.channel.dto.response.CounselingChannelResponse;
import org.example.backend.channel.dto.response.CounselorDetailResponse;
import org.example.backend.channel.dto.response.CounselorListResponse;
import org.example.backend.channel.dto.response.CounselorReviewResponse;
import org.example.backend.channel.service.CounselingChannelService;
import org.example.backend.common.exception.ErrorResponse;
import org.example.backend.security.jwt.JwtTokenProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/channels/counseling")
@RequiredArgsConstructor
@Tag(name = "상담채널", description = "상담채널 컨트롤러")
public class CounselingChannelController {

    private final CounselingChannelService counselingChannelService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;

    /**
     * 상담 채널 생성 (상담사만 가능)
     *
     * @param request 채널 생성 요청 DTO
     * @return 생성된 채널 정보
     */
    @PostMapping("/create")
    public ResponseEntity<?> createCounselingChannel(@Valid @RequestBody CounselingChannelCreateRequest request) {
        try {
            Long userId = getCurrentUserId();
            log.info("상담 채널 생성 요청: userId={}, channelName={}, channelType={}",
                    userId, request.getChannelName(), request.getChannelType());

            // 상담사 권한 검증
            validateCounselorRole(userId);

            CounselingChannelResponse response = counselingChannelService.createCounselingChannel(userId, request);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("상담 채널 생성 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("상담 채널 생성 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 생성 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 상담 채널 목록 조회 (모든 사용자 가능)
     *
     * @return 상담 채널 목록
     */
    @GetMapping
    public ResponseEntity<?> getCounselingChannelList() {
        try {
            Long userId = getCurrentUserId();
            log.info("상담 채널 목록 조회 요청: userId={}", userId);

            List<CounselingChannelResponse> channels = counselingChannelService.getCounselingChannelList(null);

            return ResponseEntity.ok(channels);
        } catch (IllegalArgumentException e) {
            log.error("상담 채널 목록 조회 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("상담 채널 목록 조회 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 내가 생성한 상담 채널 목록 조회 (상담사용)
     *
     * @return 내 상담 채널 목록
     */
    @GetMapping("/my-channels")
    public ResponseEntity<?> getMyCounselingChannelList() {
        try {
            Long userId = getCurrentUserId();
            log.info("내 상담 채널 목록 조회 요청: userId={}", userId);

            // 상담사 권한 검증
            validateCounselorRole(userId);

            List<CounselingChannelResponse> channels = counselingChannelService.getCounselingChannelList(userId);

            return ResponseEntity.ok(channels);
        } catch (IllegalArgumentException e) {
            log.error("내 상담 채널 목록 조회 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("내 상담 채널 목록 조회 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 상담사 목록 조회 API (모든 사용자 가능)
     * 모든 상담사 목록을 조회하여 메인 화면에 카드 형태로 표시하기 위한 데이터를 제공합니다.
     *
     * @param specialty 전문 분야 필터링 (선택)
     * @param minExperience 최소 경력 필터링 (선택)
     * @param pageable 페이징 정보
     * @return 상담사 목록 응답
     */
    @GetMapping("/counselors")
    public ResponseEntity<?> getCounselorList(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) Integer minExperience,
            @PageableDefault(size = 10) Pageable pageable) {

        log.info("상담사 목록 조회 요청: specialty={}, minExperience={}", specialty, minExperience);

        try {
            Page<CounselorListResponse> counselors = counselingChannelService.getCounselorList(
                    specialty, minExperience, pageable);

            return ResponseEntity.ok(counselors);
        } catch (Exception e) {
            log.error("상담사 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담사 목록을 불러오는 중 오류가 발생했습니다."));
        }
    }

    /**
     * 상담사 상세 정보 조회 API (모든 사용자 가능)
     * 특정 상담사의 상세 정보를 조회합니다.
     *
     * @param counselorId 상담사 ID
     * @return 상담사 상세 정보 응답
     */
    @GetMapping("/counselors/{counselorId}")
    public ResponseEntity<?> getCounselorDetail(@PathVariable Long counselorId) {
        log.info("상담사 상세 정보 조회 요청: counselorId={}", counselorId);

        try {
            CounselorDetailResponse counselor = counselingChannelService.getCounselorDetail(counselorId);
            return ResponseEntity.ok(counselor);
        } catch (IllegalArgumentException e) {
            log.error("상담사 상세 정보 조회 실패: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("S0004", e.getMessage()));
        } catch (Exception e) {
            log.error("상담사 상세 정보 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담사 정보를 불러오는 중 오류가 발생했습니다."));
        }
    }

    /**
     * 상담사 리뷰 조회 API (모든 사용자 가능)
     * 특정 상담사의 리뷰 목록을 조회합니다.
     *
     * @param counselorId 상담사 ID
     * @param pageable 페이징 정보
     * @return 상담사 리뷰 목록 응답
     */
    @GetMapping("/counselors/{counselorId}/reviews")
    public ResponseEntity<?> getCounselorReviews(
            @PathVariable Long counselorId,
            @PageableDefault(size = 5) Pageable pageable) {

        log.info("상담사 리뷰 조회 요청: counselorId={}", counselorId);

        try {
            Page<CounselorReviewResponse> reviews = counselingChannelService.getCounselorReviews(counselorId, pageable);
            return ResponseEntity.ok(reviews);
        } catch (IllegalArgumentException e) {
            log.error("상담사 리뷰 조회 실패: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("S0004", e.getMessage()));
        } catch (Exception e) {
            log.error("상담사 리뷰 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담사 리뷰를 불러오는 중 오류가 발생했습니다."));
        }
    }

    /**
     * 상담 요청 API (모든 사용자 가능)
     * 사용자가 특정 상담사에게 상담을 요청합니다.
     *
     * @param request 상담 요청 정보
     * @return 생성된 상담 요청 정보
     */
    @PostMapping("/request")
    public ResponseEntity<?> requestCounseling(@Valid @RequestBody CounselingRequestDto request) {
        log.info("상담 요청: counselorId={}, type={}", request.getCounselorId(), request.getCounselingType());

        try {
            Long userId = getCurrentUserId();
            Map<String, Object> response = counselingChannelService.createCounselingRequest(userId, request);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("상담 요청 실패: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("S0001", e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("상담 요청 실패 - 인증 오류: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("S0002", "인증에 실패했습니다. 로그인이 필요합니다."));
        } catch (Exception e) {
            log.error("상담 요청 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담 요청 중 오류가 발생했습니다."));
        }
    }

    /**
     * 현재 인증된 사용자의 ID를 반환
     *
     * @return 사용자 ID
     */
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.error("인증 정보가 없습니다.");
                throw new IllegalStateException("인증 정보가 없습니다.");
            }

            // Principal에서 사용자 정보 추출 시도
            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String email = userDetails.getUsername();
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new IllegalStateException("사용자 정보를 찾을 수 없습니다."));
                return user.getId();
            }

            // 토큰에서 사용자 ID 추출 시도
            if (authentication.getCredentials() instanceof String) {
                String token = (String) authentication.getCredentials();
                log.debug("토큰에서 사용자 ID 추출 시도: {}", token);
                return jwtTokenProvider.getUserIdFromToken(token);
            }

            log.error("인증 정보에서 사용자 ID를 추출할 수 없습니다. 인증 유형: {}", authentication.getClass().getName());
            throw new IllegalStateException("사용자 ID를 추출할 수 없습니다.");
        } catch (Exception e) {
            log.error("사용자 ID 추출 중 예외 발생: {}", e.getMessage(), e);
            throw new IllegalStateException("사용자 ID를 추출할 수 없습니다.", e);
        }
    }

    /**
     * 사용자가 상담사 역할인지 검증
     *
     * @param userId 사용자 ID
     * @throws IllegalArgumentException 상담사가 아닌 경우
     */
    private void validateCounselorRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!Role.ROLE_COUNSELOR.getValue().equals(user.getRole())) {
            throw new IllegalArgumentException("상담사 권한이 필요합니다.");
        }
    }
}