package org.example.backend.speech.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.backend.speech.service.SpeechServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("speech")
@Tag(name = "뇌 기능 분류 음성 녹음 전송 AI")
public class SpeechController {

    private final SpeechServiceImpl speechService;

    @Value("${speech.base-url}")
    private String sttApiUrl;

    @GetMapping("/health")
    @Operation(summary = "뇌 기능 장애 분류 AI 연결 확인", description = "뇌 기능 장애 분류 AI 연결 상태를 확인합니다.")
    public ResponseEntity<Map<String, String>> healthCheck()  {
        try {
            // WebClient를 통해 음성 AI 서버에 실제로 요청을 보냄
            String healthResponse = WebClient.create()
                    .get()
                    .uri(sttApiUrl + "/health") // AI 서버의 헬스 체크용 엔드포인트
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return ResponseEntity.ok(Map.of("status", "ok", "뇌 기능 분류 ai", "연결됨", "message", "뇌 기능 분류 AI에 정상적으로 연결되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("status", "fail", "뇌 기능 분류 ai", "연결 실패", "message", "뇌 기능 분류 AI에 연결할 수 없습니다: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/classification", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "뇌 기능 분류 음성 파일 업로드", description = "wav(16000HZ, MONO) 파일을 업로드해서 텍스트로 변환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "변환 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    public ResponseEntity<String> uploadWavAndGetTranscript(@Parameter(description = "업로드할 WAV 파일", required = true)
                                                                @RequestParam("file") MultipartFile file) {
        String transcript = speechService.processFile(file);
        return ResponseEntity.ok(transcript);
    }
}

