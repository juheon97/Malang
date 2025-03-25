package org.example.backend.auth.controller;

import jakarta.validation.Valid;
import org.example.backend.auth.dto.request.LoginRequest;
import org.example.backend.auth.dto.request.SignupRequest;
import org.example.backend.auth.dto.response.TokenResponse;
import org.example.backend.auth.model.User;
import org.example.backend.auth.service.AuthService;
import org.example.backend.security.jwt.JwtConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 관련 API 엔드포인트를 제공하는 컨트롤러
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    /**
     * 생성자를 통한 의존성 주입
     *
     * @param authService 인증 서비스
     */
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 회원가입 API 엔드포인트
     *
     * @param signupRequest 회원가입 요청 데이터
     * @return 회원가입 결과
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        logger.info("회원가입 요청 수신: {}", signupRequest.getEmail());

        try {
            // 회원가입 처리
            User user = authService.signup(signupRequest);

            // 성공 응답 반환
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("nickname", user.getNickname());
            response.put("message", "회원가입이 성공적으로 완료되었습니다.");

            logger.info("회원가입 요청 처리 완료: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // 중복 이메일, 닉네임 등 검증 오류
            logger.error("회원가입 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            // 기타 서버 오류
            logger.error("회원가입 중 예외 발생: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "회원가입 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 로그인 API 엔드포인트
     *
     * @param loginRequest 로그인 요청 데이터
     * @return 로그인 결과 및 JWT 토큰
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("로그인 요청 수신: {}", loginRequest.getEmail());

        try {
            // 로그인 처리 및 토큰 발급
            TokenResponse tokenResponse = authService.login(loginRequest);

            logger.info("로그인 요청 처리 완료: {}", loginRequest.getEmail());
            return ResponseEntity.ok(tokenResponse);
        } catch (BadCredentialsException e) {
            // 인증 실패
            logger.error("로그인 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            // 기타 서버 오류
            logger.error("로그인 중 예외 발생: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "로그인 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 토큰 갱신 API 엔드포인트
     *
     * @param request 요청 객체 (헤더에서 리프레시 토큰 추출)
     * @return 새로운 액세스 토큰
     */
    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authorizationHeader) {
        logger.info("토큰 갱신 요청 수신");

        try {
            // Authorization 헤더에서 리프레시 토큰 추출
            if (authorizationHeader == null || !authorizationHeader.startsWith(JwtConfig.TOKEN_PREFIX)) {
                throw new IllegalArgumentException("유효한 리프레시 토큰이 필요합니다.");
            }

            String refreshToken = authorizationHeader.substring(JwtConfig.TOKEN_PREFIX.length());

            // 토큰 갱신 처리
            TokenResponse tokenResponse = authService.refreshToken(refreshToken);

            logger.info("토큰 갱신 요청 처리 완료");
            return ResponseEntity.ok(tokenResponse);
        } catch (IllegalArgumentException e) {
            // 유효하지 않은 토큰 형식
            logger.error("토큰 갱신 실패 (잘못된 형식): {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // 토큰 갱신 실패 (만료, 유효하지 않은 토큰 등)
            logger.error("토큰 갱신 실패: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "토큰을 갱신할 수 없습니다. 다시 로그인해주세요.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}