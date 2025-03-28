package org.example.backend.channel.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.CounselingChannelCreateRequest;
import org.example.backend.channel.dto.response.CounselingChannelResponse;
import org.example.backend.channel.service.CounselingChannelService;
import org.example.backend.security.jwt.JwtTokenProvider;
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
public class CounselingChannelController {

    private final CounselingChannelService counselingChannelService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    /**
     * 상담 채널 생성
     *
     * @param request 채널 생성 요청 DTO
     * @return 생성된 채널 정보
     */
    @PostMapping
    public ResponseEntity<?> createCounselingChannel(@Valid @RequestBody CounselingChannelCreateRequest request) {
        try {
            Long userId = getCurrentUserId();
            log.info("상담 채널 생성 요청: userId={}, channelName={}, channelType={}",
                    userId, request.getChannelName(), request.getChannelType());

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
     * 상담사의 상담 채널 목록 조회
     *
     * @return 상담 채널 목록
     */
    @GetMapping
    public ResponseEntity<?> getCounselingChannelList() {
        try {
            Long userId = getCurrentUserId();
            log.info("상담 채널 목록 조회 요청: userId={}", userId);

            List<CounselingChannelResponse> channels = counselingChannelService.getCounselingChannelList(userId);

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
}