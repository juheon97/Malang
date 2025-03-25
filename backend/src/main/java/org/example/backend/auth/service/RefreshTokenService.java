package org.example.backend.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;


@Service
public class RefreshTokenService {
    private final StringRedisTemplate redisTemplate;

    public RefreshTokenService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static final String KEY_PREFIX = "refreshToken:";

    //refresh token redis 저장 메서드
    public void save(Long userId, String refreshToken, Long ttlSeconds) {
        String key = KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, refreshToken, Duration.ofSeconds(ttlSeconds));
    }

    //refresh token 만료 TTL 시간 로그 메서드
    public void logCurrentTTL(Long userId) {
        String key = "refreshToken:" + userId;
        Long ttl = redisTemplate.getExpire(key);
        System.out.println("🟢 Redis TTL of key [" + key + "] = " + "remain " + ttl + " seconds");
    }

    public boolean isValid(Long userId, String refreshToken) {
        String key = KEY_PREFIX + userId;
        String saved = redisTemplate.opsForValue().get(key);
        return refreshToken.equals(saved);
    }

    public void delete(Long userId) {
        redisTemplate.delete(KEY_PREFIX + userId);
    }
}
