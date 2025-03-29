package org.example.backend.localllm.service;

import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.localllm.client.SummaryClient;
import org.example.backend.localllm.dto.request.SummaryRequest;
import org.example.backend.localllm.dto.response.SummaryResponse;
import org.example.backend.localllm.model.Summary;
import org.example.backend.localllm.repository.SummaryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
public class SummaryServiceImpl implements SummaryService {

    private final SummaryRepository summaryRepository;
    private final SummaryClient llmClient;

    public SummaryServiceImpl(SummaryRepository summaryRepository, SummaryClient llmClient) {
        this.summaryRepository = summaryRepository;
        this.llmClient = llmClient;
    }

    @Override
    public void summarizeAndSave(SummaryRequest dto) {
        SummaryResponse summary = llmClient.requestSummary(dto.getMessages());

        if (summary.getSummary_topic() == null) {
            throw new IllegalArgumentException("summary_topic이 비어 있습니다. LLM 응답이 올바르지 않습니다.");
        }

        Summary entity = Summary.builder()
                .user(User.of(dto.getUserId()))
                .counselor(User.of(dto.getCounselorUserId()))
                .summaryTopic(summary.getSummary_topic())
                .symptoms(summary.getSymptoms())
                .treatment(summary.getTreatment())
                .counselorNote(summary.getCounselor_note())
                .nextSchedule(parseDate(summary.getNext_schedule()))
                .build();

        summaryRepository.save(entity);
    }

    private LocalDateTime parseDate(String input) {
        try {
            if (input == null || input.isBlank()) {
                return null; // 또는 LocalDateTime.now() 등 fallback 값 설정
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            return LocalDateTime.parse(input, formatter);
        } catch (DateTimeParseException e) {
            return null; // 또는 fallback
        }
    }
}
