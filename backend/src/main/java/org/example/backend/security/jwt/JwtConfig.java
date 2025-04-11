package org.example.backend.security.jwt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 관련 상수 및 설정값을 관리하는 클래스
 */
@Configuration
public class JwtConfig {

    /**
     * JWT 발행자
     */
    public static final String TOKEN_ISSUER = "mal-lang-project";

    /**
     * JWT 토큰 타입
     */
    public static final String TOKEN_TYPE = "Bearer";

    /**
     * Authorization 요청 헤더 이름
     */
    public static final String AUTHORIZATION_HEADER = "Authorization";

    /**
     * 헤더에서 토큰을 추출할 때 제거할 접두사 (Bearer )
     */
    public static final String TOKEN_PREFIX = "Bearer ";

    /**
     * JWT 시크릿 키 (application.properties에서 읽어옴)
     */
    @Value("${jwt.secret}")
    private String secretKey;

    /**
     * 액세스 토큰 유효 시간(초) (application.properties에서 읽어옴)
     */
    @Value("${jwt.access-token-validity-in-seconds}")
    private long accessTokenValidity;

    /**
     * 리프레시 토큰 유효 시간(초) (application.properties에서 읽어옴)
     */
    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenValidity;

    /**
     * JWT 시크릿 키 반환
     *
     * @return 시크릿 키
     */
    public String getSecretKey() {
        return secretKey;
    }

    /**
     * 액세스 토큰 유효 시간(초) 반환
     *
     * @return 액세스 토큰 유효 시간
     */
    public long getAccessTokenValidity() {
        return accessTokenValidity;
    }

    /**
     * 리프레시 토큰 유효 시간(초) 반환
     *
     * @return 리프레시 토큰 유효 시간
     */
    public long getRefreshTokenValidity() {
        return refreshTokenValidity;
    }
}