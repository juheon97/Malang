package org.example.backend.channel.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 상담 요청 데이터 전송 객체
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CounselingRequestDto {

    @NotBlank(message = "상담사 ID는 필수 입력 항목입니다.")
    private Long counselorId;  // 상담사 ID

    @NotBlank(message = "상담 유형은 필수 입력 항목입니다.")
    private String counselingType;  // 상담 유형 ("NORMAL" 또는 "GROUP")

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    @NotNull(message = "희망 상담 일시는 필수 입력 항목입니다.")
    private LocalDateTime desiredDateTime;  // 희망 상담 일시

    @Size(max = 500, message = "메시지는 최대 500자까지 입력 가능합니다.")
    private String message;  // 상담사에게 전달할 메시지
}