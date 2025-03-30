package org.example.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backend.common.exception.ErrorResponse;
import org.example.backend.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security 설정 클래스
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * UserDetailsService 구현체 참조
     */
    private final UserDetailsService userDetailsService;

    /**
     * JSON 변환을 위한 ObjectMapper
     */
    private final ObjectMapper objectMapper;

    /**
     * JWT 인증 필터
     */
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * 생성자를 통한 의존성 주입
     * @param userDetailsService 사용자 상세 정보 서비스
     * @param objectMapper JSON 변환기
     * @param jwtAuthenticationFilter JWT 인증 필터
     */
    public SecurityConfig(UserDetailsService userDetailsService, ObjectMapper objectMapper,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * 비밀번호 인코더 빈 정의
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager 빈 정의
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * CORS 설정을 위한 빈 정의
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // CORS 설정
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",
                "https://j12d110.p.ssafy.io",
                "https://*.ngrok-free.app",  // 이건 반드시 allowedOriginPatterns 로만 가능
                "https://backend.takustory.site"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList
                ("Authorization", "Content-Type", "X-Requested-With", "Upgrade", "Connection","Cache-Control",
                        "Pragma",
                        "Expires"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Cache-Control"));  // Cache-Control 추가

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * SecurityFilterChain 빈 정의 - 보안 필터 체인 구성
     * server.servlet.context-path=/api 설정을 고려하여 URL 패턴에서 /api 프리픽스 제거
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // CORS 설정 활성화
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // HTTP 요청에 대한 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증 관련 엔드포인트는 모든 사용자 접근 허용 + Security 예외를 추가 - swagger
                        .requestMatchers("/auth/login", "/auth/signup", "/auth/signup/counselor", "/auth/token/refresh", "/swagger-ui.html", "/swagger-ui/**", "/swagger-resources/**", "/api-docs/**", "/webjars/**").permitAll()
                        // 로그아웃은 인증된 사용자만 접근 허용
                        .requestMatchers("/auth/logout").authenticated()
                        // 공개 리소스는 모든 사용자 접근 허용
                        .requestMatchers("/public/**").permitAll()
                        // Swagger UI 및 API 문서 접근 허용
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // 정적 리소스 접근 허용
                        .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                        // 상담 채널 기본 조회 API는 모든 인증된 사용자 접근 허용
                        .requestMatchers(
                                "/channels/counseling",
                                "/channels/counseling/counselors",
                                "/channels/counseling/counselors/*",
                                "/channels/counseling/counselors/*/reviews").authenticated()
                        // 상담 채널 생성 API는 상담사 권한만 접근 허용
                        .requestMatchers(
                                "/channels/counseling/create",
                                "/channels/counseling/update/*",
                                "/channels/counseling/delete/*").hasAuthority("ROLE_COUNSELOR")
                        // Community 모든 요청은 인증 필요 (GET 포함)
                        .requestMatchers("/community/**").authenticated()
                        // Voice 채널 모든 요청은 인증 필요
                        .requestMatchers("/channels/voice/**").authenticated()
                        // 상담사 프로필 API는 ROLE_COUNSELOR 권한이 있는 사용자만 접근 가능
                        .requestMatchers("/counselor/profile/**").hasAuthority("ROLE_COUNSELOR")
                        // WebScoket 관련 엔드포인트 접근 허용
                        .requestMatchers("/ws/**", "/sub/**", "/pub/**", "/ws/info/**").permitAll()
                        // 기타 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // 세션 관리 정책 설정 - 세션을 사용하지 않고 상태를 유지하지 않음
                .sessionManagement(session -> session
                        // 세션 생성 정책을 STATELESS로 설정 - JWT 인증을 위한 설정
                        .sessionCreationPolicy(STATELESS)
                )

                // UserDetailsService 설정
                .userDetailsService(userDetailsService)

                // 인증 실패 핸들러 설정
                .exceptionHandling(exceptions -> exceptions
                        // 인증되지 않은 사용자가 보안된 리소스에 접근할 때 호출됨
                        .authenticationEntryPoint((request, response, authException) -> {
                            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "인증에 실패했습니다. 로그인이 필요합니다.");
                        })
                        // 인증된 사용자가 자신에게 허용되지 않은 리소스에 접근할 때 호출됨
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            sendErrorResponse(response, HttpStatus.FORBIDDEN, "해당 리소스에 접근할 권한이 없습니다.");
                        })
                );

        // JWT 인증 필터 활성화
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 에러 응답을 JSON 형식으로 클라이언트에게 전송
     *
     * @param response HTTP 응답 객체
     * @param status HTTP 상태 코드
     * @param message 에러 메시지
     * @throws IOException JSON 변환 과정에서 발생할 수 있는 예외
     */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        // 응답 상태 코드 설정
        response.setStatus(status.value());

        // 응답 컨텐츠 타입을 JSON으로 설정
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // ErrorResponse 객체 생성
        ErrorResponse errorResponse = new ErrorResponse(status.value(), message);

        // ErrorResponse 객체를 JSON 문자열로 변환하여 응답 본문에 작성
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}