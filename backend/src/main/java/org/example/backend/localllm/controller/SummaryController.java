package org.example.backend.localllm.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.localllm.dto.request.SummaryRequest;
import org.example.backend.localllm.dto.response.SummaryResponse;
import org.example.backend.localllm.service.SummaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Local LLM", description = "redis 에 저장된 채팅 내역을 Local LLM 을 통해 요약본을 가지고 올 수 있습니다.")
@RestController
@RequestMapping("/summary")
public class SummaryController {
    private final SummaryService summaryService;
    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;


    public SummaryController(SummaryService summaryService, UserRepository userRepository, CounselorRepository counselorRepository) {
        this.summaryService = summaryService;
        this.userRepository = userRepository;
        this.counselorRepository = counselorRepository;
    }

    @GetMapping("/counselor/{counselorId}")
    public List<SummaryResponse> getSummariesByCounselor(@PathVariable Long counselorId) {
        return summaryService.getAllSummariesByCounselorId(counselorId);
    }

    @PostMapping
    public ResponseEntity<SummaryResponse> summarize(
            @RequestBody SummaryRequest dto,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("인증된 사용자가 존재하지 않습니다."));

        if (!user.getRole().equals("ROLE_COUNSELOR")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }


        Counselor counselor = counselorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("상담사 정보가 없습니다."));

        Long counselorId = counselor.getId(); // 올바르게 추출된 counselor_id

        SummaryResponse summary = summaryService.summarizeAndSave(dto, counselorId);


        return ResponseEntity.ok(summary); // 프론트로 요약 응답 전송
    }

}
