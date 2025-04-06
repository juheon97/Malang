package org.example.backend.localllm.service;

import org.example.backend.localllm.dto.request.SummaryRequest;
import org.example.backend.localllm.dto.response.SummaryResponse;
import org.springframework.stereotype.Service;

@Service
public interface SummaryService {

    SummaryResponse summarizeAndSave(SummaryRequest dto, Long counselorUserId);
}
