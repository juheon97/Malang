package org.example.backend.s3.summarychatlog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SummaryChatLogDto {
    private Long userId;
    private Long counselorId;
    private String fileName;        // 텍스트 파일 이름 또는 키
    private String downloadUrl;     // presigned URL
    private LocalDateTime uploadedAt;
}

