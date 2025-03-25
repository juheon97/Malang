package org.example.backend.auth.dto.response;

import org.example.backend.security.jwt.JwtTokenDto;

/**
 * 인증 성공 시 클라이언트에게 반환하는 토큰 정보 DTO 클래스
 */
public class TokenResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private String userId;
    private String nickname;

    // 기본 생성자
    public TokenResponse() {
    }

    /**
     * JwtTokenDto로부터 TokenResponse 객체 생성
     *
     * @param jwtTokenDto JWT 토큰 DTO
     * @param userId 사용자 ID
     * @param nickname 사용자 닉네임
     * @return TokenResponse 객체
     */
    public static TokenResponse from(JwtTokenDto jwtTokenDto, String userId, String nickname) {
        TokenResponse response = new TokenResponse();
        response.setAccessToken(jwtTokenDto.getAccessToken());
        response.setRefreshToken(jwtTokenDto.getRefreshToken());
        response.setTokenType(jwtTokenDto.getTokenType());
        response.setExpiresIn(jwtTokenDto.getExpiresIn());
        response.setUserId(userId);
        response.setNickname(nickname);
        return response;
    }

    // Getter 및 Setter
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}