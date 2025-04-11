package org.example.backend.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * 애플리케이션의 캐싱 설정 클래스
 */
@Configuration
@EnableCaching
public class CacheConfig {
    // 기본 캐싱 설정은 Spring의 ConcurrentMapCache를 사용합니다.
    // 프로덕션 환경에서는 Redis와 같은 외부 캐시 서버를 사용하는 것이 좋습니다.

    // Redis 캐시 설정 예시:
    /*
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))  // 캐시 유효 시간 설정
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
    */
}