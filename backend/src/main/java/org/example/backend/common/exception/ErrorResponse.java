package org.example.backend.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * API 요청 실패 시 클라이언트에게 반환되는 에러 응답 형식 정의
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final String errorCode;
    private final String message;
    private final LocalDateTime timestamp = LocalDateTime.now();
    private Map<String, String> details;

    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
    }

    public ErrorResponse(int status, String message) {
        this.message = message;

        // 상태 코드에 따라 에러 코드 매핑
        switch (status) {
            case 400: this.errorCode = "S0001"; break; // Bad Request
            case 401: this.errorCode = "S0002"; break; // Unauthorized
            case 403: this.errorCode = "S0003"; break; // Forbidden
            case 404: this.errorCode = "S0004"; break; // Not Found
            case 409: this.errorCode = "S0006"; break; // Conflict
            default: this.errorCode = "S0005"; break;  // Internal Server Error
        }
    }

    public ErrorResponse(String errorCode, String message, Map<String, String> details) {
        this.errorCode = errorCode;
        this.message = message;
        this.details = details;
    }

    public void addDetail(String field, String errorMessage) {
        if (this.details == null) {
            this.details = new HashMap<>();
        }
        this.details.put(field, errorMessage);
    }
}