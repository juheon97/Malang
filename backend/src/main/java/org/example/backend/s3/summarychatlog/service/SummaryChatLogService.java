package org.example.backend.s3.summarychatlog.service;

import org.example.backend.s3.summarychatlog.dto.SummaryChatLogDto;
import org.example.backend.s3.summarychatlog.model.SummaryChatLog;

import java.util.List;

public interface SummaryChatLogService {
    void saveLog(Long userId, Long counselorId, Long channelId, String jsonKey, String textKey);
    List<SummaryChatLogDto> getAllTextLogsForCounselor(Long counselorId);
    String getMaskedLogDownloadUrl(Long logId);

}
