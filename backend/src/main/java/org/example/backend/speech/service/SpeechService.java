package org.example.backend.speech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.speech.util.AudioConvertUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechService {

    @Value("${speech.base-url}")
    private String sttApiUrl;

    private final WebClient webClient = WebClient.create(); // 혹은 Bean 주입 방식

    private final AudioConvertUtil audioConvertUtil;


    public String processPcmFile(MultipartFile file) {
        File wavTempFile = null;
        File pcmTempFile = null;
        try {
            log.info("STT 요청 받은 파일: {}", file.getOriginalFilename());

            // 1. MultipartFile → Temp WAV file
            wavTempFile = convertToTempFile(file);

            // 2. Create temp PCM file
            pcmTempFile = File.createTempFile("converted-", ".pcm");

            // 3. FFmpeg 변환 수행
            audioConvertUtil.convertWavToPcmWithFfmpeg(wavTempFile, pcmTempFile);
            log.info("PCM 변환 완료: {}", pcmTempFile.getAbsolutePath());

// ✅ 4. saved_pcm 디렉토리에 복사 저장
            File targetDir = new File("src/saved_pcm"); // 상대경로 주의 (실행 위치 기준)
            if (!targetDir.exists()) targetDir.mkdirs(); // 디렉토리 없으면 생성

            File savedPcmFile = new File(targetDir, pcmTempFile.getName());
            Files.copy(pcmTempFile.toPath(), savedPcmFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            log.info("✅ PCM 파일 저장 위치: {}", savedPcmFile.getAbsolutePath());

// 5. WebClient 요청
            if (!savedPcmFile.exists() || savedPcmFile.length() == 0) {
                throw new RuntimeException("저장된 PCM 파일 없음 또는 비어 있음");
            }

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            byte[] bytes = Files.readAllBytes(savedPcmFile.toPath());
            ByteArrayResource resource = new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return savedPcmFile.getName(); // 꼭 override
                }
            };

            builder
                    .part("file", resource)
                    .header("Content-Disposition", "form-data; name=\"file\"; filename=\"" + savedPcmFile.getName() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM);
            Thread.sleep(100);

            String response = webClient
                    .post()
                    .uri(sttApiUrl + "/stt")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                String refinedMessage = extractErrorMessage(errorBody);
                                log.error("🛑 STT API Error Body: {}", refinedMessage);
                                return Mono.error(new RuntimeException("STT API 호출 실패: " + refinedMessage));
                            }))
                    .bodyToMono(String.class)
                    .block();

            if (savedPcmFile.exists()) {
                boolean deleted = savedPcmFile.delete();
                log.info("저장된 PCM 파일 삭제 여부: {}", deleted);
            }

            // 5. 응답 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(response);
            return json.get("transcript").asText();
//            return "로컬 저장 완료: " + savedFile.getAbsolutePath(); // 테스트 시 반환




        } catch (Exception e) {
            throw new RuntimeException("STT 처리 중 오류 발생", e);
        } finally {
            if (wavTempFile != null && wavTempFile.exists()) wavTempFile.delete();
            if (pcmTempFile != null && pcmTempFile.exists()) pcmTempFile.delete();
        }
    }

    private File convertToTempFile(MultipartFile multipartFile) throws IOException {
        File tempFile = File.createTempFile("upload-", ".wav");
        multipartFile.transferTo(tempFile);
        return tempFile;
    }

    private String extractErrorMessage(String errorBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(errorBody);
            if (root.has("message")) {
                return root.get("message").asText();
            }
        } catch (Exception ignored) {}
        return errorBody; // JSON 파싱 실패 시 원본 반환
    }
}
