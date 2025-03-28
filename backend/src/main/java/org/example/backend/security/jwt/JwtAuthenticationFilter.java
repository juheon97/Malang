package org.example.backend.security.jwt;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT 토큰을 검증하고 인증 정보를 설정하는 필터
 * 각 HTTP 요청마다 한 번씩 실행되어 JWT 토큰 기반의 인증을 처리
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // 인증이 필요 없는 URL 패턴 목록
    private static final List<String> AUTH_WHITELIST = Arrays.asList(
            "/auth/login",
            "/auth/signup",
            "/auth/token/refresh",
            "/ws/**",
            "/ws/info",
            
            "/swagger-ui.html",      // Swagger UI 메인 페이지
            "/swagger-ui/**",      // Swagger UI 리소스 (css, js 등)
            "/v3/api-docs",        // OpenAPI 명세 기본 경로 (단일 파일)
            "/v3/api-docs/**",     // OpenAPI 명세 하위 경로 (그룹, 설정 등 포함)
            "/swagger-resources/**", // Swagger 리소스 (필요시)
            "/webjars/**"          // Webjar 리소스 (필요시)
    );

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * 생성자를 통한 의존성 주입
     *
     * @param jwtTokenProvider JWT 토큰 생성 및 검증 유틸리티
     * @param userDetailsService 사용자 정보 로드 서비스
     */
    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    /**
     * 특정 요청 경로에 대해 필터를 적용하지 않도록 설정
     *
     * @param request 현재 HTTP 요청
     * @return 필터를 적용하지 않을 경우 true, 적용할 경우 false
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath(); // getRequestURI() 대신 getServletPath() 사용

        logger.debug("현재 요청 경로: {}", path);

        // 정확한 경로 매칭을 위해 startsWith 사용
        boolean shouldNotFilterResult = AUTH_WHITELIST.stream()
                .anyMatch(pattern -> path.startsWith(pattern));

        logger.debug("필터 제외 여부: {}", shouldNotFilterResult);

        return shouldNotFilterResult;
    }

    /**
     * 요청이 들어올 때마다 JWT 토큰을 확인하고 유효한 경우 SecurityContext에 인증 정보 설정
     *
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param filterChain 필터 체인
     * @throws ServletException 서블릿 예외
     * @throws IOException IO 예외
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        String servletPath = request.getServletPath();
        logger.debug("Request URI: {}, Servlet Path: {}", requestURI, servletPath);

        try {
            // HTTP 요청에서 JWT 토큰 추출
            String jwt = getJwtFromRequest(request);

            // 토큰이 있고 유효한 경우 처리
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                // 토큰에서 사용자 이메일 추출
                String email = jwtTokenProvider.getEmailFromToken(jwt);

                // UserDetails 로드
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Authentication 객체 생성
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                // 요청 세부 정보 설정
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // SecurityContext에 Authentication 객체 설정
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // 디버깅을 위한 로그
                logger.debug("사용자 '{}' 인증 성공", email);
            }
        } catch (Exception ex) {
            // 인증 처리 중 오류 발생 시 로깅
            logger.error("인증 정보를 설정할 수 없습니다: {}", ex.getMessage());
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청에서 JWT 토큰을 추출하는 메서드
     *
     * @param request HTTP 요청
     * @return 추출된 JWT 토큰, 없거나 형식이 맞지 않으면 null 반환
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        // Authorization 헤더에서 토큰 추출
        String bearerToken = request.getHeader(JwtConfig.AUTHORIZATION_HEADER);

        // 토큰이 "Bearer "로 시작하는지 확인하고 접두사 제거
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(JwtConfig.TOKEN_PREFIX)) {
            return bearerToken.substring(JwtConfig.TOKEN_PREFIX.length());
        }

        return null;
    }
}