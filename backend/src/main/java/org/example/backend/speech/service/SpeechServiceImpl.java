package org.example.backend.speech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechServiceImpl implements SpeechService {

    @Value("${speech.base-url}")
    private String sttApiUrl;

    private final WebClient webClient = WebClient.create(); // 혹은 Bean 주입 방식


    public String processFile(MultipartFile file) {
        File tempFile = null;

        try {
            // 1. MultipartFile → File 변환
            tempFile = File.createTempFile("upload-" + System.nanoTime(), ".wav");
            file.transferTo(tempFile);

            // 2. MultipartBodyBuilder로 전송 준비
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(tempFile))
                    .header("Content-Disposition", "form-data; name=file; filename=" + tempFile.getName());

            // 3. WebClient 호출
            String response = webClient.post()
                    .uri(sttApiUrl + "/classification")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // 4. 응답 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("transcript")) {
                return jsonNode.get("transcript").asText();
            } else if (jsonNode.has("정상") && jsonNode.has("뇌 질환")) {
                float normal = jsonNode.get("정상").floatValue() * 100; // 편향 장애인 데이터로 보정값 설정
                float brain = jsonNode.get("뇌 질환").floatValue();
                log.info("[STT] 분류 결과 - 정상*100: {}, 정상: {}, 뇌 질환: {}", normal, normal/100, brain);
                return String.format("정상: %.6f%%, 뇌 질환: %.6f%%", normal, brain);
            } else {
                throw new RuntimeException("AI 응답 포맷이 예상과 다름: " + response);
            }

        } catch (Exception e) {
            throw new RuntimeException("뇌 기능 장애 분류 처리 중 오류 발생", e);
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
}
