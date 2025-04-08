package org.example.backend.speech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechServiceImpl implements SpeechService {

    @Value("${speech.base-url}")
    private String speechApiUrl;

    private final RestTemplate restTemplate;

    public String processFile(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();

            // 1. ByteArrayResource 생성 (파일 이름 포함)
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            // 2. Multipart 데이터 구성
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. RestTemplate 호출
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(
                    speechApiUrl + "/classification",
                    requestEntity,
                    String.class
            );

            String responseBody = responseEntity.getBody();

            // 4. 응답 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            if (jsonNode.has("transcript")) {
                return jsonNode.get("transcript").asText();
            } else if (jsonNode.has("정상") && jsonNode.has("뇌 질환")) {
                float normal = jsonNode.get("정상").floatValue();
                float brain = jsonNode.get("뇌 질환").floatValue();
                log.info("[STT] 분류 결과 - 정상*100: {}, 정상: {}, 뇌 질환: {}", normal, normal / 100, brain);
                return String.format("정상: %.6f%%, 뇌 질환: %.6f%%", normal, brain);
            } else {
                throw new RuntimeException("AI 응답 포맷이 예상과 다름: " + responseBody);
            }

        } catch (Exception e) {
            log.error("뇌 기능 장애 분류 처리 중 오류 발생", e);
            throw new RuntimeException("뇌 기능 장애 분류 처리 중 오류 발생", e);
        }
    }
}
