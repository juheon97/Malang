package org.example.backend.localllm.client;

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

    public SummaryResponse requestSummary(List<Map<String, String>> redisMessages) {
        // 여기에 messages 형식 포함된 JSON 생성 + 전송
        // 시스템 프롬프트 설정
        Map<String, String> systemMessage = Map.of(
                "role", "system",
                "content", "너는 정신건강 상담 내용을 요약하는 비서야. 다음 형식에 맞춰 객관적이고 간결하게 작성해. 반드시 요약 문장으로만 작성할 것.\n\n- 상담 주제:\n- 주요 증상:\n- 진행된 치료/훈련:\n- 상담사 소감:\n- 다음 상담 일정:"
        );

        // 전체 메시지 구성
        List<Map<String, String>> allMessages = new ArrayList<>();
        allMessages.add(systemMessage);
        allMessages.addAll(redisMessages); // Redis에서 불러온 대화 리스트 삽입

        // 요청 바디 구성
        Map<String, Object> requestBody = Map.of(
                "model", "kanana-nano-2.1b-instruct-abliterated-i1",
                "temperature", 0.3,
                "max_tokens", 2000,
                "messages", allMessages
        );

        return webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(SummaryResponse.class)
                .block();
    }
}
