package org.example.backend.localllm.service;

import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.localllm.client.SummaryClient;
import org.example.backend.localllm.dto.request.SummaryRequest;
import org.example.backend.localllm.dto.response.SummaryResponse;
import org.example.backend.localllm.model.Summary;
import org.example.backend.localllm.repository.SummaryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

@Service
public class SummaryServiceImpl implements SummaryService {

    private final SummaryRepository summaryRepository;
    private final SummaryClient llmClient;

    public SummaryServiceImpl(SummaryRepository summaryRepository, SummaryClient llmClient) {
        this.summaryRepository = summaryRepository;
        this.llmClient = llmClient;

    }

    @Override
    public SummaryResponse summarizeAndSave(SummaryRequest dto, Long counselorId) {
        SummaryResponse summary = llmClient.requestSummary(dto.getMessages());

        if (summary.getSummary_topic() == null) {
            throw new IllegalArgumentException("summary_topic이 비어 있습니다. LLM 응답이 올바르지 않습니다.");
        }

        Summary entity = Summary.builder()
                .user(User.of(dto.getUserId()))
                .counselor(Counselor.of(counselorId))
                .summaryTopic(summary.getSummary_topic())
                .symptoms(summary.getSymptoms())
                .treatment(summary.getTreatment())
                .counselorNote(summary.getCounselor_note())
                .nextSchedule(parseDate(summary.getNext_schedule()))
                .build();

        summaryRepository.save(entity);

        return summary;
    }

    private LocalDateTime parseDate(String input) {
        try {
            if (input == null || input.isBlank()) return null;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            // LocalDate로 먼저 파싱한 뒤 LocalDateTime으로 변환
            return LocalDate.parse(input, formatter).atStartOfDay();
        } catch (DateTimeParseException e) {
            return null; // fallback
        }
    }

}
