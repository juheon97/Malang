package org.example.backend.channel.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.VoiceChannelCreateRequest;
import org.example.backend.channel.dto.response.VoiceChannelResponse;
import org.example.backend.channel.service.VoiceChannelService;
import org.example.backend.security.jwt.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/channels/voice") // api/ 접두사 제거함
@RequiredArgsConstructor
public class VoiceChannelController {

    private final VoiceChannelService voiceChannelService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    /**
     * 음성 채널 생성
     *
     * @param request 채널 생성 요청 DTO
     * @return 생성된 채널 정보
     */
    @PostMapping
    public ResponseEntity<?> createVoiceChannel(@Valid @RequestBody VoiceChannelCreateRequest request) {
        try {
            Long userId = getCurrentUserId();
            log.info("음성 채널 생성 요청: userId={}, channelName={}", userId, request.getChannelName());

            VoiceChannelResponse response = voiceChannelService.createVoiceChannel(userId, request);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("음성 채널 생성 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("음성 채널 생성 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 생성 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 음성 채널 목록 조회
     *
     * @return 음성 채널 목록
     */
    @GetMapping
    public ResponseEntity<?> getVoiceChannelList() {
        try {
            log.info("음성 채널 목록 조회 요청");

            List<VoiceChannelResponse> channels = voiceChannelService.getVoiceChannelList();

            return ResponseEntity.ok(channels);
        } catch (Exception e) {
            log.error("음성 채널 목록 조회 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 특정 음성 채널 조회
     *
     * @param channelId 채널 ID
     * @return 채널 정보
     */
    @GetMapping("/{channelId}")
    public ResponseEntity<?> getVoiceChannel(@PathVariable String channelId) {
        try {
            log.info("음성 채널 조회 요청: channelId={}", channelId);

            VoiceChannelResponse channel = voiceChannelService.getVoiceChannel(channelId);

            return ResponseEntity.ok(channel);
        } catch (IllegalArgumentException e) {
            log.error("음성 채널 조회 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("음성 채널 조회 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 채널 비밀번호 확인
     *
     * @param channelId 채널 ID
     * @param requestBody 비밀번호 요청 바디
     * @return 확인 결과
     */
    @PostMapping("/{channelId}/password-check")
    public ResponseEntity<?> checkChannelPassword(
            @PathVariable String channelId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String password = requestBody.get("password");
            log.info("채널 비밀번호 확인 요청: channelId={}", channelId);

            boolean isPasswordCorrect = voiceChannelService.checkChannelPassword(channelId, password);

            Map<String, Object> response = new HashMap<>();
            response.put("isPasswordCorrect", isPasswordCorrect);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("채널 비밀번호 확인 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("채널 비밀번호 확인 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "비밀번호 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 현재 인증된 사용자의 ID를 반환
     * 더 강건한 오류 처리 로직 추가
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

    @DeleteMapping("/{channelId}")
    public ResponseEntity<?> deleteVoiceChannel(@PathVariable String channelId) {
        try {
            log.info("음성 채널 삭제 요청: channelId={}", channelId);

            voiceChannelService.deleteVoiceChannel(channelId);

            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("음성 채널 삭제 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("음성 채널 삭제 중 예외 발생: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "채널 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}