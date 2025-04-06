package org.example.backend.speech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;

@Service
@RequiredArgsConstructor
public class SpeechService {

    @Value("${speech.base-url}")
    private String sttApiUrl;

    private final WebClient webClient = WebClient.create(); // 혹은 Bean 주입 방식

    public String processPcmFile(MultipartFile file) {
        File tempFile = null;

        try {
            // 1. MultipartFile → 실제 파일로 저장
            tempFile = File.createTempFile("upload-", ".pcm");
            file.transferTo(tempFile);

            // 2. WebClient로 전송
            String response = webClient.post()
                    .uri(sttApiUrl + "/stt")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData("file", new FileSystemResource(tempFile)))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // 3. JSON에서 transcript 추출
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.get("transcript").asText();

        } catch (Exception e) {
            throw new RuntimeException("STT 처리 중 오류 발생", e);
        } finally {
            // 4. 파일 삭제
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
}
