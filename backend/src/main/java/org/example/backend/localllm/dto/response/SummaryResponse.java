package org.example.backend.localllm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {
    private String summary_topic;
    private String symptoms;
    private String treatment;
    private String counselor_note;
    private String next_schedule;
}
