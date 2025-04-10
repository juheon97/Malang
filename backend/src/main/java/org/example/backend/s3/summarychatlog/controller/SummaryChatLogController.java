package org.example.backend.s3.summarychatlog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.backend.s3.S3Uploader;
import org.example.backend.s3.summarychatlog.dto.SummaryChatLogDto;
import org.example.backend.s3.summarychatlog.model.SummaryChatLog;
import org.example.backend.s3.summarychatlog.repository.SummaryChatLogRepository;
import org.example.backend.s3.summarychatlog.service.SummaryChatLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/summary-log")
@Tag(name = "상담 로그 조회")
public class SummaryChatLogController {

    private final SummaryChatLogService summaryChatLogService;

    @GetMapping("/masked-text")
    @Operation(summary = "마스킹된 상담 텍스트 Presigned URL 반환")
    public ResponseEntity<String> getMaskedTextLog(@RequestParam Long logId) {
        String url = summaryChatLogService.getMaskedLogDownloadUrl(logId);
        return ResponseEntity.ok(url);
    }

}
