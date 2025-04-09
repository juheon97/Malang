package org.example.backend.s3.summarychatlog.service;

import org.example.backend.s3.summarychatlog.model.SummaryChatLog;

public interface SummaryChatLogService {
    void saveLog(Long userId, Long counselorId, Long channelId,
                 String jsonKey, String textKey);
}
