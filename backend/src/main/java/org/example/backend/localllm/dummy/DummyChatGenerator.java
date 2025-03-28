package org.example.backend.localllm.dummy;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DummyChatGenerator {

    private final RedisTemplate<String, String> redisTemplate;

    public DummyChatGenerator(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void createDummyChatLog(String channelId) {
        List<String> dummyLogs = List.of(
                "{\"role\":\"user\",\"nickname\":\"김싸피\",\"message\":\"요즘 불안해서 잠을 못 자요\",\"timestamp\":\"2025-03-28T10:30\"}",
                "{\"role\":\"counselor\",\"nickname\":\"이상담\",\"message\":\"그 불안이 어디서 오는지 생각해볼까요?\",\"timestamp\":\"2025-03-28T10:31\"}"
        );
        for (String log : dummyLogs) {
            redisTemplate.opsForList().rightPush("chat:" + channelId, log);
        }
    }
}