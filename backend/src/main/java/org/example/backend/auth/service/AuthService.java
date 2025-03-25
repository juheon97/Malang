package org.example.backend.auth.service;

import org.example.backend.auth.dto.request.LoginRequest;
import org.example.backend.auth.dto.request.SignupRequest;
import org.example.backend.auth.dto.response.TokenResponse;
import org.example.backend.auth.model.Role;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.security.jwt.JwtTokenDto;
import org.example.backend.security.jwt.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 인증 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class AuthService {

    private final RefreshTokenService refreshTokenService;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 생성자를 통한 의존성 주입
     *
     * @param userRepository 사용자 정보 접근 저장소
     * @param passwordEncoder 비밀번호 암호화 도구
     * @param jwtTokenProvider JWT 토큰 생성 도구
     */
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * 회원가입 처리
     *
     * @param signupRequest 회원가입 요청 데이터
     * @return 가입된 사용자 정보
     * @throws IllegalArgumentException 유효하지 않은 요청 데이터인 경우
     */
    @Transactional
    public User signup(SignupRequest signupRequest) {
        logger.info("회원가입 처리 시작: {}", signupRequest.getEmail());

        // 이메일 중복 검사
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            logger.error("이미 등록된 이메일: {}", signupRequest.getEmail());
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }

        // 닉네임 중복 검사
        if (userRepository.existsByNickname(signupRequest.getNickname())) {
            logger.error("이미 사용 중인 닉네임: {}", signupRequest.getNickname());
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(signupRequest.getPassword());

        // 사용자 엔티티 생성
        User user = User.builder()
                .email(signupRequest.getEmail())
                .password(encodedPassword)
                .nickname(signupRequest.getNickname())
                .profileUrl(signupRequest.getProfileUrl())
                .role(Role.ROLE_USER.getValue()) // 기본적으로 일반 사용자 역할 부여
                .build();

        // 사용자 정보 저장
        User savedUser = userRepository.save(user);
        logger.info("회원가입 성공: {}", savedUser.getEmail());

        return savedUser;
    }

    /**
     * 로그인 처리
     *
     * @param loginRequest 로그인 요청 데이터
     * @return 토큰 응답 객체
     * @throws BadCredentialsException 인증 실패 시
     */
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest loginRequest) {
        logger.info("로그인 시도: {}", loginRequest.getEmail());

        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    logger.error("등록되지 않은 이메일: {}", loginRequest.getEmail());
                    return new BadCredentialsException("등록되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.");
                });

        // 비밀번호 검증
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            logger.error("비밀번호 불일치: {}", loginRequest.getEmail());
            throw new BadCredentialsException("등록되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰 생성
        JwtTokenDto jwtTokenDto = jwtTokenProvider.generateTokenDto(user);
        logger.info("로그인 성공 및 토큰 발급: {}", user.getEmail());

        // ✅ Redis에 RefreshToken 저장
        refreshTokenService.save(
                user.getId(),
                jwtTokenDto.getRefreshToken(),
                jwtTokenDto.getRefreshTokenExpiresIn()
        );
        logger.info("리프레시 토큰 정상 저장: userid : {}, refreshtoken : {}, refreshtokenexpiresin : {}",
                user.getId(),
                jwtTokenDto.getRefreshToken(),
                jwtTokenDto.getRefreshTokenExpiresIn());

        refreshTokenService.logCurrentTTL(user.getId());

        // 토큰 응답 객체 생성 및 반환
        return TokenResponse.from(jwtTokenDto, String.valueOf(user.getId()), user.getNickname());
    }

    /**
     * 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
     *
     * @param refreshToken 리프레시 토큰
     * @return 새로운 토큰 응답 객체
     * @throws Exception 토큰 갱신 실패 시
     */
    @Transactional(readOnly = true)
    public TokenResponse refreshToken(String refreshToken) throws Exception {
        logger.info("토큰 갱신 요청");

        // 리프레시 토큰 검증 및 액세스 토큰 재발급
        JwtTokenDto jwtTokenDto = jwtTokenProvider.refreshToken(refreshToken);
        logger.info("토큰 갱신 성공");

        // 토큰에서 사용자 이메일 추출
        String email = jwtTokenProvider.getEmailFromToken(jwtTokenDto.getAccessToken());

        // 사용자 정보 조회
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return TokenResponse.from(jwtTokenDto, String.valueOf(user.getId()), user.getNickname());
        } else {
            // 사용자 정보 없이 기본 응답 반환
            TokenResponse response = new TokenResponse();
            response.setAccessToken(jwtTokenDto.getAccessToken());
            response.setRefreshToken(jwtTokenDto.getRefreshToken());
            response.setTokenType(jwtTokenDto.getTokenType());
            response.setExpiresIn(jwtTokenDto.getExpiresIn());
            response.setRefreshTokenExpiresIn(jwtTokenDto.getRefreshTokenExpiresIn());
            return response;
        }
    }
}