package org.example.backend.localllm.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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

@Schema(description = "상담 요약 요청")
public class SummaryRequest {

    @Schema(example = "1")
    private Long userId;

    @Schema(example = "2")
    private Long counselorUserId;

    @Schema(example = "1")
    private Long channelId; // Redis key

    @Schema(description = "상담 메시지 리스트 예시",
            example = "[{\"role\":\"ROLE_USER\",\"content\":\"요즘 불안해서 잠을 잘 못 자요.\" ,\"currentTime\":\"currentTime.toString\"}," +
                    "{\"role\":\"ROLE_COUNSELOR\",\"content\":\"최근에 어떤 일이 있었나요?\" ,\"currentTime\":\"currentTime.toString\"}," +
                    "{\"role\": \"ROLE_USER\", \"content\":\"회사에서 실수를 몇 번 했고, 계속 걱정이 돼요.\" ,\"currentTime\":\"currentTime.toString\"}," +
                    "{\"role\":\"ROLE_COUNSELOR\",\"content\":\"그 상황이 많이 스트레스를 주었겠네요. 실수를 반복하지 않으려는 부담도 있으셨을 것 같아요.\" ,\"currentTime\":\"currentTime.toString\"}," +
                    "{\"role\": \"ROLE_USER\", \"content\":\"맞아요. 그래서 밤에 자려고 해도 자꾸 생각이 나요.\" ,\"currentTime\":\"currentTime.toString\"}," +
                    "{\"role\":\"ROLE_COUNSELOR\",\"content\":\"벌써 시간이 다 되었네요. 다음 상담은 25년 3월 31일 월요일입니다.\" ,\"currentTime\":\"currentTime.toString\"}]"
    )
    private List<Map<String, String>> messages; // LLM 메시지 포맷
}
