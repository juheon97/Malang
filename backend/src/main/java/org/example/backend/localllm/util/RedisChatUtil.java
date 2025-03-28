package org.example.backend.localllm.util;

import org.json.JSONException;
import org.json.JSONObject;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class RedisChatUtil {
    public List<Map<String, String>> convertToLLMMessages(List<String> redisLogs) {
        List<Map<String, String>> messages = new ArrayList<>();
        for (String log : redisLogs) {
            try {
                JSONObject json = new JSONObject(log);
                messages.add(Map.of(
                        "role", json.getString("role"),
                        "content", json.getString("nickname") + ": " + json.getString("message")
                ));
            } catch (JSONException e) {
                // 로그 남기고 스킵
                System.err.println("잘못된 JSON 형식: " + log);
            }
        }
        return messages;
    }
}