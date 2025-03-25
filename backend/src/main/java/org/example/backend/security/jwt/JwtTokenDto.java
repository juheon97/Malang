package org.example.backend.security.jwt;

/**
 * JWT 토큰 정보를 담는 DTO 클래스
 * 인증 요청 및 응답에서 사용됨
 */
public class JwtTokenDto {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;

    /**
     * 기본 생성자
     */
    public JwtTokenDto() {
        this.tokenType = JwtConfig.TOKEN_TYPE;
    }

    /**
     * 모든 필드를 받는 생성자
     *
     * @param accessToken 접근 토큰
     * @param refreshToken 리프레시 토큰
     * @param expiresIn 접근 토큰 만료 시간(초)
     */
    public JwtTokenDto(String accessToken, String refreshToken, Long expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = JwtConfig.TOKEN_TYPE;
        this.expiresIn = expiresIn;
    }

    /**
     * AccessToken만 받는 생성자
     *
     * @param accessToken 접근 토큰
     */
    public JwtTokenDto(String accessToken) {
        this.accessToken = accessToken;
        this.tokenType = JwtConfig.TOKEN_TYPE;
    }

    // Getter 및 Setter 메서드
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    /**
     * 인증 헤더 값 형식으로 반환 (예: "Bearer <access_token>")
     *
     * @return 인증 헤더 값
     */
    public String getAuthorizationHeader() {
        return this.tokenType + " " + this.accessToken;
    }
}