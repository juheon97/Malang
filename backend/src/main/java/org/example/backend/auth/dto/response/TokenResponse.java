package org.example.backend.auth.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.example.backend.security.jwt.JwtTokenDto;

/**
 * 인증 성공 시 클라이언트에게 반환하는 토큰 정보 DTO 클래스
 */
@Getter
@Setter
@NoArgsConstructor
public class TokenResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Long refreshTokenExpiresIn;
    private String userId;
    private String nickname;
    private Boolean disabilityStatus; // 시각장애 여부 필드 추가

    /**
     * JwtTokenDto로부터 TokenResponse 객체 생성
     *
     * @param jwtTokenDto JWT 토큰 DTO
     * @param userId 사용자 ID
     * @param nickname 사용자 닉네임
     * @param disabilityStatus 시각장애 여부
     * @return TokenResponse 객체
     */
    public static TokenResponse from(JwtTokenDto jwtTokenDto, String userId, String nickname, Boolean disabilityStatus) {
        TokenResponse response = new TokenResponse();
        response.setAccessToken(jwtTokenDto.getAccessToken());
        response.setRefreshToken(jwtTokenDto.getRefreshToken());
        response.setTokenType(jwtTokenDto.getTokenType());
        response.setExpiresIn(jwtTokenDto.getExpiresIn());
        response.setRefreshTokenExpiresIn(jwtTokenDto.getRefreshTokenExpiresIn());
        response.setUserId(userId);
        response.setNickname(nickname);
        response.setDisabilityStatus(disabilityStatus);
        return response;
    }
}