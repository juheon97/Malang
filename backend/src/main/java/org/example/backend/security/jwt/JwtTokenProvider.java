package org.example.backend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.example.backend.auth.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT 토큰 생성 및 검증을 담당하는 클래스
 */
@Component
public class JwtTokenProvider {

    // JWT 서명에 사용되는 보안 키
    private final Key key;

    // Access Token 만료 시간 (ms)
    private final long accessTokenValidityInMilliseconds;

    // Refresh Token 만료 시간 (ms)
    private final long refreshTokenValidityInMilliseconds;

    // JWT 설정
    private final JwtConfig jwtConfig;

    /**
     * 생성자를 통한 의존성 주입 및 초기화
     *
     * @param jwtConfig JWT 설정 정보 클래스
     */
    public JwtTokenProvider(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.key = Keys.hmacShaKeyFor(jwtConfig.getSecretKey().getBytes());
        this.accessTokenValidityInMilliseconds = jwtConfig.getAccessTokenValidity() * 1000;
        this.refreshTokenValidityInMilliseconds = jwtConfig.getRefreshTokenValidity() * 1000;
    }

    /**
     * Spring Security Authentication 객체로부터 JWT Access Token 생성
     *
     * @param authentication Spring Security 인증 객체
     * @return 생성된 Access Token
     */
    public String createAccessToken(Authentication authentication) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        // 사용자 권한 목록을 문자열 리스트로 변환
        List<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 토큰에 포함될 claims(페이로드) 설정
        Claims claims = Jwts.claims().setSubject(authentication.getName());
        claims.put("auth", authorities);

        // 토큰 생성 및 반환
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .setIssuer(JwtConfig.TOKEN_ISSUER)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 사용자 정보로부터 JWT Access Token 생성
     *
     * @param user 사용자 정보 객체
     * @return 생성된 Access Token
     */
    public String createAccessToken(User user) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        // 토큰에 포함될 claims(페이로드) 설정
        Claims claims = Jwts.claims().setSubject(user.getEmail());
        claims.put("userId", user.getId());
        claims.put("auth", user.getRole());

        // 토큰 생성 및 반환
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .setIssuer(JwtConfig.TOKEN_ISSUER)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 사용자 ID로부터 Refresh Token 생성
     *
     * @param email 사용자 이메일
     * @return 생성된 Refresh Token
     */
    public String createRefreshToken(String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(validity)
                .setIssuer(JwtConfig.TOKEN_ISSUER)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Access Token과 Refresh Token을 포함한 JWT Token DTO 생성
     *
     * @param authentication Spring Security 인증 객체
     * @return JWT Token DTO
     */
    public JwtTokenDto generateTokenDto(Authentication authentication) {
        String accessToken = createAccessToken(authentication);
        String refreshToken = createRefreshToken(authentication.getName());

        return new JwtTokenDto(
                accessToken,
                refreshToken,
                JwtConfig.TOKEN_TYPE,
                accessTokenValidityInMilliseconds / 1000,
                refreshTokenValidityInMilliseconds / 1000);  // refreshToken 만료 시간 추가
    }

    /**
     * 사용자 정보로부터 JWT Token DTO 생성
     *
     * @param user 사용자 정보 객체
     * @return JWT Token DTO
     */
    public JwtTokenDto generateTokenDto(User user) {
        String accessToken = createAccessToken(user);
        String refreshToken = createRefreshToken(user.getEmail());

        return new JwtTokenDto(
                accessToken,
                refreshToken,
                JwtConfig.TOKEN_TYPE,
                accessTokenValidityInMilliseconds / 1000,
                refreshTokenValidityInMilliseconds / 1000);  // refreshToken 만료 시간 추가
    }

    /**
     * Refresh Token을 사용하여 새로운 Access Token 발급
     *
     * @param refreshToken 리프레시 토큰
     * @return 새로 발급된 Access Token이 포함된 JWT Token DTO
     * @throws Exception 토큰이 유효하지 않거나 만료된 경우
     */
    public JwtTokenDto refreshToken(String refreshToken) throws Exception {
        // Refresh Token 검증
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(refreshToken)
                    .getBody();

            // Refresh Token에서 사용자 이메일 추출
            String email = claims.getSubject();

            // 사용자 이메일로 새 액세스 토큰 생성
            String newAccessToken = createAccessTokenFromEmail(email);

            // 새 액세스 토큰만 포함된 JWT Token DTO 반환
            // 참고: 이 메서드에서는 Refresh Token은 재생성하지 않음
            return new JwtTokenDto(
                    newAccessToken,
                    refreshToken,  // 기존 리프레시 토큰 재사용
                    JwtConfig.TOKEN_TYPE,
                    accessTokenValidityInMilliseconds / 1000,
                    refreshTokenValidityInMilliseconds / 1000);  // refreshToken 만료 시간 추가
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new Exception("Expired refresh token");
        } catch (Exception e) {
            throw new Exception("Invalid refresh token: " + e.getMessage());
        }
    }

    /**
     * 사용자 이메일만으로 Access Token 생성
     * 주로 리프레시 토큰에서 추출한 사용자 이메일로 새 액세스 토큰을 발급할 때 사용
     *
     * @param email 사용자 이메일
     * @return 생성된 Access Token
     */
    private String createAccessTokenFromEmail(String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        // 사용자 이메일로만 기본 토큰 생성
        // 참고: 실제 구현에서는 이 시점에 사용자 정보를 DB에서 조회하여
        // 더 많은 정보(권한 등)를 토큰에 포함시키는 것이 좋음
        Claims claims = Jwts.claims().setSubject(email);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .setIssuer(JwtConfig.TOKEN_ISSUER)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWT 토큰의 유효성 검증
     *
     * @param token 검증할 토큰
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            System.out.println("Empty JWT token");
            return false;
        }

        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException e) {
            System.out.println("Invalid JWT signature: " + e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            System.out.println("Malformed JWT token: " + e.getMessage());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.out.println("Expired JWT token: " + e.getMessage());
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            System.out.println("Unsupported JWT token: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("JWT token compact of handler are invalid: " + e.getMessage());
        }
        return false;
    }

    /**
     * 토큰의 만료 여부 확인
     *
     * @param token 검사할 토큰
     * @return 만료되었으면 true, 유효하면 false
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            // 토큰 파싱 중 다른 예외가 발생한 경우에도 만료된 것으로 간주
            return true;
        }
    }

    /**
     * JWT 토큰에서 사용자 이메일 추출
     *
     * @param token JWT 토큰
     * @return 토큰에 저장된 사용자 이메일
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * JWT 토큰에서 모든 클레임(내용) 추출
     *
     * @param token JWT 토큰
     * @return 토큰의 클레임 정보
     */
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     *
     * @param token JWT 토큰
     * @return 토큰에 저장된 사용자 ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return Long.parseLong(claims.get("userId").toString());
    }

    /**
     * JWT 토큰에서 인증 정보 추출
     *
     * @param token JWT 토큰
     * @return 토큰에 저장된 권한 정보
     */
    public String getAuthFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("auth").toString();
    }

    /**
     * HTTP 요청 헤더에서 JWT 토큰 추출
     *
     * @param authorizationHeader 인증 헤더 값
     * @return 추출된 토큰, 형식이 맞지 않거나 토큰이 없으면 null 반환
     */
    public String resolveToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith(JwtConfig.TOKEN_PREFIX)) {
            return authorizationHeader.substring(JwtConfig.TOKEN_PREFIX.length());
        }
        return null;
    }
}