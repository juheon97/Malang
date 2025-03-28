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
    private String summaryTopic;
    private String symptoms;
    private String treatment;
    private String counselorNote;
    private String nextSchedule;
}
