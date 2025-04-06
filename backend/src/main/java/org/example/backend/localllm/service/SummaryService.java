package org.example.backend.localllm.service;

import org.example.backend.localllm.dto.request.SummaryRequest;
import org.springframework.stereotype.Service;

@Service
public interface SummaryService {

    void summarizeAndSave(SummaryRequest dto, Long counselorUserId);
}
