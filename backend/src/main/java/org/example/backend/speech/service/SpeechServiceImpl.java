package org.example.backend.speech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechServiceImpl implements SpeechService {

    private final WebClient speechWebClient;

    public String processFile(MultipartFile file) {
        try {
            // 1. MultipartFile에서 바이트 배열 추출
            byte[] fileBytes = file.getBytes();

            // 2. ByteArrayResource로 변환 (파일 이름도 설정)
            ByteArrayResource byteArrayResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            // 3. MultipartBodyBuilder로 전송 준비
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", byteArrayResource);

            // 4. WebClient 호출
            String response = speechWebClient.post()
                    .uri("/classification")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            // 5. 응답 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("transcript")) {
                return jsonNode.get("transcript").asText();
            } else if (jsonNode.has("정상") && jsonNode.has("뇌 질환")) {
                float normal = jsonNode.get("정상").floatValue() * 100; // 보정값 적용
                float brain = jsonNode.get("뇌 질환").floatValue();
                log.info("[STT] 분류 결과 - 정상*100: {}, 정상: {}, 뇌 질환: {}", normal, normal/100, brain);
                return String.format("정상: %.6f%%, 뇌 질환: %.6f%%", normal, brain);
            } else {
                throw new RuntimeException("AI 응답 포맷이 예상과 다름: " + response);
            }

        } catch (Exception e) {
            log.error("뇌 기능 장애 분류 처리 중 오류 발생", e);
            throw new RuntimeException("뇌 기능 장애 분류 처리 중 오류 발생", e);
        }
    }
}