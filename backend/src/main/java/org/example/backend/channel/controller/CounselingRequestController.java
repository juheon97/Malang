package org.example.backend.channel.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.CounselingRequestDto;
import org.example.backend.channel.service.CounselingRequestService;
import org.example.backend.common.exception.ErrorResponse;
import org.example.backend.security.jwt.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/channels/counseling/request")
@RequiredArgsConstructor
@Tag(name = "상담요청", description = "상담 요청 및 상태 관리 컨트롤러")
public class CounselingRequestController {

    private final CounselingRequestService counselingRequestService;
    private final CounselorRepository counselorRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 상담사별 대기중인 채널 목록 조회 API (상담사만 가능)
     * 상담사가 생성한 대기중(상태:0) 채널 목록을 조회합니다.
     *
     * @return 대기중인 채널 목록
     */
    @GetMapping("/my-channels")
    public ResponseEntity<?> getMyCounselingChannels() {
        try {
            Long userId = getCurrentUserId();

            // 상담사 정보 조회
            Counselor counselor = counselorRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

            List<Map<String, Object>> channels = counselingRequestService.getCounselingRequests(counselor.getId());
            return ResponseEntity.ok(channels);
        } catch (IllegalArgumentException e) {
            log.error("상담 채널 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("S0001", e.getMessage()));
        } catch (Exception e) {
            log.error("상담 채널 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담 채널 목록 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 사용자가 참여 가능한 상담 채널 목록 조회 API (모든 인증된 사용자 가능)
     * 대기중(상태:0) 상태인 모든 상담 채널 목록을 조회합니다.
     *
     * @return 참여 가능한 상담 채널 목록
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCounselingChannels() {
        try {
            List<Map<String, Object>> channels = counselingRequestService.getAvailableCounselingChannels();
            return ResponseEntity.ok(channels);
        } catch (Exception e) {
            log.error("참여 가능한 상담 채널 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담 채널 목록 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 상담 요청 API (사용자가 상담사의 채널에 참여 요청)
     * 사용자가 대기중(상태:0) 상태의 상담 채널에 참여 요청하여
     * 채널 상태를 진행중(상태:1)으로 변경합니다.
     *
     * @param channelId 채널 ID
     * @return 상담 요청 결과
     */
    @PostMapping("/{channelId}")
    public ResponseEntity<?> requestCounseling(@PathVariable Long channelId) {
        try {
            Long userId = getCurrentUserId();

            Map<String, Object> response = counselingRequestService.requestCounseling(channelId, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("상담 요청 실패: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("S0001", e.getMessage()));
        } catch (Exception e) {
            log.error("상담 요청 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담 요청 중 오류가 발생했습니다."));
        }
    }

    /**
     * 상담 종료 API (상담사만 가능)
     * 상담사가 진행중(상태:1) 상태의 상담을 종료하여
     * 채널 상태를 종료됨(상태:2)으로 변경합니다.
     *
     * @param channelId 채널 ID
     * @return 종료된 상담 정보
     */
    @PostMapping("/{channelId}/end")
    public ResponseEntity<?> endCounseling(@PathVariable Long channelId) {
        try {
            Long userId = getCurrentUserId();

            // 상담사 정보 조회
            Counselor counselor = counselorRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

            Map<String, Object> response = counselingRequestService.endCounseling(channelId, counselor.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("상담 종료 실패: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("S0001", e.getMessage()));
        } catch (Exception e) {
            log.error("상담 종료 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("S0005", "상담 종료 중 오류가 발생했습니다."));
        }
    }

    /**
     * 현재 인증된 사용자의 ID를 반환
     *
     * @return 사용자 ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
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
    }
}