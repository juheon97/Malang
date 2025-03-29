package org.example.backend.localllm.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryRequest {
    private Long userId;
    private Long counselorUserId;
    private String channelId; // Redis key
    private List<Map<String, String>> messages; // LLM 메시지 포맷
}
