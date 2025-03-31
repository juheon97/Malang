package org.example.backend.auth.service;

import org.example.backend.auth.dto.request.CounselorSignupRequest;
import org.example.backend.auth.dto.request.LoginRequest;
import org.example.backend.auth.dto.request.SignupRequest;
import org.example.backend.auth.dto.response.TokenResponse;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.Role;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorProfileRepository;
import org.example.backend.auth.repository.CounselorRepository;
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

    private final CounselorRepository counselorRepository;
    private final CounselorProfileRepository counselorProfileRepository;

    /**
     * 생성자를 통한 의존성 주입
     *
     * @param userRepository 사용자 정보 접근 저장소
     * @param passwordEncoder 비밀번호 암호화 도구
     * @param jwtTokenProvider JWT 토큰 생성 도구
     * @param refreshTokenService 리프레시 토큰 서비스
     * @param counselorRepository 상담사 정보 접근 저장소
     * @param counselorProfileRepository 상담사 프로필 정보 접근 저장소
     */
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       RefreshTokenService refreshTokenService,
                       CounselorRepository counselorRepository,
                       CounselorProfileRepository counselorProfileRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.counselorRepository = counselorRepository;
        this.counselorProfileRepository = counselorProfileRepository;
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

//        // 닉네임 중복 검사
//        if (userRepository.existsByNickname(signupRequest.getNickname())) {
//            logger.error("이미 사용 중인 닉네임: {}", signupRequest.getNickname());
//            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
//        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(signupRequest.getPassword());

        // 사용자 엔티티 생성
        User user = User.builder()
                .email(signupRequest.getEmail())
                .password(encodedPassword)
                .nickname(signupRequest.getNickname())
                .profileUrl(signupRequest.getProfileUrl())
                .role(Role.ROLE_USER.getValue()) // 기본적으로 일반 사용자 역할 부여
                .disabilityStatus(signupRequest.getDisabilityStatus()) // 시각장애 여부 추가
                .build();

        // 사용자 정보 저장
        User savedUser = userRepository.save(user);
        logger.info("회원가입 성공: {}", savedUser.getEmail());

        return savedUser;
    }

    /**
     * 상담사 회원가입 처리
     *
     * @param request 상담사 회원가입 요청 데이터
     * @return 가입된 상담사 정보와 사용자 정보
     * @throws IllegalArgumentException 유효하지 않은 요청 데이터인 경우
     */
    @Transactional
    public Counselor signupCounselor(CounselorSignupRequest request) {
        logger.info("상담사 회원가입 처리 시작: {}", request.getEmail());

        // 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.error("이미 등록된 이메일: {}", request.getEmail());
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }

//        // 닉네임 중복 검사
//        if (userRepository.existsByNickname(request.getNickname())) {
//            logger.error("이미 사용 중인 닉네임: {}", request.getNickname());
//            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
//        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 사용자 엔티티 생성 (상담사 역할 부여)
        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .profileUrl(request.getProfileUrl())
                .role(Role.ROLE_COUNSELOR.getValue()) // 상담사 역할 부여
                .disabilityStatus(null) // 상담사는 시각장애 여부 해당 없음
                .build();

        // 사용자 정보 저장
        User savedUser = userRepository.save(user);
        logger.info("사용자 정보 저장 완료: {}", savedUser.getEmail());

        // 상담사 ID 생성 - UUID 대신 Long 타입 사용
        Long counselorId = generateCounselorId();

        // 상담사 엔티티 생성
        Counselor counselor = Counselor.builder()
                .id(counselorId)
                .user(savedUser)
                .name(request.getName())
                .gender(request.getGender())
                .birthdate(request.getBirthdate())
                .build();

        // 상담사 정보 저장
        Counselor savedCounselor = counselorRepository.save(counselor);
        logger.info("상담사 정보 저장 완료: {}", savedCounselor.getId());

        // 상담사 프로필 엔티티 생성 (자격증 정보 포함)
        CounselorProfile counselorProfile = CounselorProfile.builder()
                .id(counselorId)
                .user(savedUser)
                .certifications(request.getCertificationString()) // Y 또는 N
                .status(0) // 기본 상태 (0)
                .build();

        // 상담사 프로필 정보 저장
        CounselorProfile savedProfile = counselorProfileRepository.save(counselorProfile);
        logger.info("상담사 프로필 정보 저장 완료: {}", savedProfile.getId());

        return savedCounselor;
    }

    /**
     * Long 타입의 상담사 ID 생성 메서드
     * @return 생성된 상담사 ID
     */
    private Long generateCounselorId() {
        // 기존에 존재하는 상담사 ID 중 최대값 + 1 을 반환
        Long maxId = counselorRepository.findAll().stream()
                .map(Counselor::getId)
                .max(Long::compareTo)
                .orElse(0L);

        return maxId + 1;
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
        return TokenResponse.from
                (jwtTokenDto, String.valueOf(user.getId()), user.getNickname(), user.getDisabilityStatus(), user.getRole());
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
            return TokenResponse.from(jwtTokenDto, String.valueOf(user.getId()), user.getNickname(), user.getDisabilityStatus(), user.getRole());
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

    /**
     * 로그아웃 처리
     * 사용자의 액세스 토큰을 무효화하고 리프레시 토큰을 Redis에서 삭제합니다.
     *
     * @param token JWT 액세스 토큰
     * @throws IllegalArgumentException 유효하지 않은 토큰인 경우
     */
    @Transactional
    public void logout(String token) {
        logger.info("로그아웃 처리 시작");

        // 토큰이 유효한지 검증
        if (!jwtTokenProvider.validateToken(token)) {
            logger.error("유효하지 않은 토큰으로 로그아웃 시도");
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        try {
            // 토큰에서 사용자 ID 추출
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            logger.debug("로그아웃 처리 중인 사용자 ID: {}", userId);

            // Redis에서 리프레시 토큰 삭제
            refreshTokenService.delete(userId);

            logger.info("사용자 ID {} 로그아웃 처리 완료", userId);
        } catch (Exception e) {
            logger.error("로그아웃 처리 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("로그아웃 처리 중 오류가 발생했습니다.", e);
        }
    }
}