package org.example.backend.s3.summarychatlog.service;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.example.backend.s3.S3Uploader;
import org.example.backend.s3.summarychatlog.dto.SummaryChatLogDto;
import org.example.backend.s3.summarychatlog.model.SummaryChatLog;
import org.example.backend.s3.summarychatlog.repository.SummaryChatLogRepository;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SummaryChatLogServiceImpl implements SummaryChatLogService {

    private final SummaryChatLogRepository summaryChatLogRepository;
    private S3Uploader s3Uploader;

    public void saveLog(Long userId, Long counselorId, Long channelId,
                        String jsonKey, String textKey) {

        SummaryChatLog log = SummaryChatLog.builder()
                .userId(userId)
                .counselorId(counselorId)
                .channelId(channelId)
                .jsonS3Key(jsonKey)
                .textS3Key(textKey)
                .uploadedAt(LocalDateTime.now())
                .build();

        summaryChatLogRepository.save(log);
    }

    public List<SummaryChatLogDto> getAllTextLogsForCounselor(Long counselorId) {
        List<SummaryChatLog> logs = summaryChatLogRepository.findByCounselorId(counselorId);

        return logs.stream()
                .sorted(Comparator.comparing(SummaryChatLog::getUploadedAt).reversed()) // 최신순 정렬
                .map(log -> SummaryChatLogDto.builder()
                        .userId(log.getUserId())
                        .counselorId(log.getCounselorId())
                        .fileName(log.getTextS3Key())
                        .downloadUrl(s3Uploader.generatePresignedUrl(log.getTextS3Key()))
                        .uploadedAt(log.getUploadedAt())
                        .build())
                .toList();
    }

    public void updateMaskedLog(Long logId, File maskedFile) {
        String key = "summarylogs/masked/log_" + logId + "_" + UUID.randomUUID() + ".txt";
        s3Uploader.uploadPrivateFile(maskedFile, key);

        SummaryChatLog log = summaryChatLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("해당 로그가 없습니다."));
        log.setMaskedTextS3Key(key);
        summaryChatLogRepository.save(log);
    }

    public String getMaskedLogDownloadUrl(Long logId) {
        SummaryChatLog log = summaryChatLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("해당 로그가 없습니다."));

        if (log.getMaskedTextS3Key() == null) {
            throw new IllegalStateException("아직 마스킹된 로그가 없습니다.");
        }

        return s3Uploader.generatePresignedUrl(log.getMaskedTextS3Key());
    }


}
