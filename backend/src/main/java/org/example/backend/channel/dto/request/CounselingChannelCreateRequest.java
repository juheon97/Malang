package org.example.backend.channel.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CounselingChannelCreateRequest {

    @NotBlank(message = "방 이름은 필수 입력 항목입니다.")
    @Size(min = 2, max = 20, message = "방 이름은 2~20자 사이여야 합니다.")
    private String channelName;

    @Min(value = 1, message = "최소 인원은 1명 이상이어야 합니다.")
    @Max(value = 3, message = "최대 인원은 3명 이하여야 합니다.")
    private int maxPlayer;

    private String channelType; // "NORMAL"(일반 상담) 또는 "GROUP"(그룹 상담)

    @Size(max = 100, message = "방 설명은 최대 100자까지 입력 가능합니다.")
    private String description; // 선택 사항
}