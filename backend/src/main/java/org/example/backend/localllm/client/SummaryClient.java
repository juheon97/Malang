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
                "content", "역할: 당신은 정신건강 상담 내용을 요약하는 비서입니다.\n" +
                        "목표: 다음 JSON 구조에 따라 상담 내용을 요약합니다. 대화체는 제거하고 요약 문장으로만 작성합니다.\n" +
                        "금지사항: 내담자가 언급하지 않은 내용을 추가하거나 추측하지 않습니다. 반드시 한국어로 작성합니다.\n\n" +
                        "- \"25년 xx월 xx일\"과 같은 표현은 반드시 \"2025-xx-xx\" 형식의 날짜로 변환합니다.\n" +
                        "- 다음 상담 일정이 언급되지 않은 경우, \"next_schedule\" 필드 값은 \"미정\"으로 작성합니다.\n" +
                        "- 연도는 반드시 2025로 고정하며, 두 자리 연도는 계산 없이 \"2025\"로 해석해야 합니다.\n" +
                        "- ISO 8601 형식 (\"YYYY-MM-DD\")을 따릅니다. 예: \"2025-03-31\"\n" +
                        "- 날짜는 반드시 문자열 형태로 작성합니다. 예: \"next_schedule\": \"2025-03-31\"\n" +
                        "- \"25년 xx월 xx일\" 또는 \"25.05.01\"과 같은 연도 표현이 있는 경우,\n" +
                        "  반드시 현재 연도 기준으로 2025년으로 해석해야 합니다.\n" +
                        "- \"25\"라는 두 자리 연도는 절대 계산하거나 덧셈으로 추론하지 말고, 무조건 \"2025\"로 해석하세요.\n" +
                        "- 어떤 경우에도 2100년 이상 또는 2000년 미만의 연도는 생성하면 안 됩니다.\n" +
                        "- 연도 입력이 없으면 currentTime 기반의 4자리수 연도로 추측하세요.\n\n" +
                        "출력 형식:\n" +
                        "{\n" +
                        "  \"summary_topic\": \"...\",\n" +
                        "  \"symptoms\": \"...\",\n" +
                        "  \"treatment\": \"...\",\n" +
                        "  \"counselor_note\": \"...\",\n" +
                        "  \"next_schedule\": \"2025-xx-xx\" 또는 \"미정\"\n" +
                        "}"
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
