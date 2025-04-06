package org.example.backend.localllm.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.example.backend.localllm.dto.response.SummaryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class SummaryClient {

    private final WebClient webClient;

    public SummaryClient(WebClient.Builder builder, @Value("${llm.base-url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    private List<Map<String, String>> convertRoles(List<Map<String, String>> messages) {
        return messages.stream()
                .map(message -> {
                    String role = message.get("role");
                    String newRole = switch (role) {
                        case "ROLE_COUNSELOR" -> "assistant";
                        case "ROLE_USER" -> "user";
                        default -> role;
                    };
                    return Map.of(
                            "role", newRole,
                            "content", message.get("content")
                    );
                })
                .toList();
    }


    public SummaryResponse requestSummary(List<Map<String, String>> redisMessages) {
        // Step 1. Role 변환
        List<Map<String, String>> convertedMessages = convertRoles(redisMessages);

        // Step 2. 시스템 프롬프트 삽입
        Map<String, String> systemMessage = Map.of(
                "role", "system",
                "content", "너는 정신건강 상담 내용을 요약하는 비서야. 다음 형식에 맞춰 객관적이고 간결하게 작성해. 반드시 요약 문장으로만 작성할 것. \"25년\", \"26년\"처럼 연도에 두 자리 숫자가 있을 경우 반드시 \"2025\", \"2026\" 등으로 해석해야 합니다.\n" +
                        "- 어떤 경우에도 2100년 이상 또는 2000년 미만의 연도는 사용하지 마세요.\n, \n\n- 상담 주제:\n- 주요 증상:\n- 진행된 치료/훈련:\n- 상담사 소감:\n- 다음 상담 일정:"
        );

        List<Map<String, String>> allMessages = new ArrayList<>();
        allMessages.add(systemMessage);
        allMessages.addAll(convertedMessages);

        Map<String, Object> requestBody = Map.of(
                "model", "kanana-nano-2.1b-instruct-abliterated-i1",
                "temperature", 0.3,
                "max_tokens", 2000,
                "messages", allMessages
        );

        Map<String, Object> responseMap = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseMap == null) {
            throw new RuntimeException("LLM 응답이 null입니다.");
        }

        Map<String, Object> firstChoice = ((List<Map<String, Object>>) responseMap.get("choices")).get(0);
        Map<String, String> message = (Map<String, String>) firstChoice.get("message");
        String contentJson = message.get("content");

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(contentJson, SummaryResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("LLM 응답 content 파싱 실패: " + contentJson, e);
        }
    }
}
