package org.example.backend.s3.summarychatlog.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.s3.summarychatlog.model.SummaryChatLog;
import org.example.backend.s3.summarychatlog.repository.SummaryChatLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SummaryChatLogServiceImpl implements SummaryChatLogService {

    private final SummaryChatLogRepository summaryChatLogRepository;

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
}
