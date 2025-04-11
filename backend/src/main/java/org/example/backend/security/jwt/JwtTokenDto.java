package org.example.backend.security.jwt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * JWT 토큰 정보를 담는 DTO 클래스
 * 인증 요청 및 응답에서 사용됨
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
public class JwtTokenDto {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Long refreshTokenExpiresIn;


    /**
     * 인증 헤더 값 형식으로 반환 (예: "Bearer <access_token>")
     *
     * @return 인증 헤더 값
     */
    public String getAuthorizationHeader() {
        return this.tokenType + " " + this.accessToken;
    }
}