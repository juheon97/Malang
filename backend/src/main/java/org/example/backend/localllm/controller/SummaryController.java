package org.example.backend.localllm.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.localllm.dto.request.SummaryRequest;
import org.example.backend.localllm.service.SummaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Local LLM", description = "redis 에 저장된 채팅 내역을 Local LLM 을 통해 요약본을 가지고 올 수 있습니다.")
@RestController
@RequestMapping("/summary")
public class SummaryController {
    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @PostMapping
    public ResponseEntity<Void> summarize(@RequestBody SummaryRequest dto, @AuthenticationPrincipal User user) {

        if (!user.getRole().equals("ROLE_COUNSELOR")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long counselorUserId = user.getId(); // 요걸 summary 테이블의 counselor_user_id에 저장
        summaryService.summarizeAndSave(dto, counselorUserId);

        return ResponseEntity.ok().build();
    }
}
