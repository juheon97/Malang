package org.example.backend.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * API 요청 실패 시 클라이언트에게 반환되는 에러 응답 형식 정의
 */
@JsonInclude(JsonInclude.Include.NON_NULL) // null 값을 가진 필드는 JSON 응답에서 제외
public class ErrorResponse {

    private final String errorCode;      // 에러 코드 (예: S0001, S0002 등)
    private final String message;        // 에러 메시지
    private final LocalDateTime timestamp; // 에러 발생 시간
    private Map<String, String> details; // 상세 에러 정보 (필드 유효성 검사 등)

    /**
     * 기본 생성자 - 에러 코드와 메시지만 포함하는 에러 응답 생성
     *
     * @param errorCode 에러 코드
     * @param message 에러 메시지
     */
    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 상태 코드와 메시지로 ErrorResponse 생성 (SecurityConfig에서 사용)
     * 상태 코드에 따라 적절한 에러 코드 매핑
     *
     * @param status HTTP 상태 코드
     * @param message 에러 메시지
     */
    public ErrorResponse(int status, String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();

        // 상태 코드에 따라 에러 코드 매핑
        switch (status) {
            case 400:
                this.errorCode = "S0001"; // Bad Request
                break;
            case 401:
                this.errorCode = "S0002"; // Unauthorized
                break;
            case 403:
                this.errorCode = "S0003"; // Forbidden
                break;
            case 404:
                this.errorCode = "S0004"; // Not Found
                break;
            case 409:
                this.errorCode = "S0006"; // Conflict
                break;
            default:
                this.errorCode = "S0005"; // Internal Server Error (기본값)
                break;
        }
    }

    /**
     * 상세 에러 정보를 포함하는 생성자
     *
     * @param errorCode 에러 코드
     * @param message 에러 메시지
     * @param details 상세 에러 정보 (필드 이름 -> 에러 메시지)
     */
    public ErrorResponse(String errorCode, String message, Map<String, String> details) {
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.details = details;
    }

    // Getter 메서드들
    public String getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    // details 필드에 에러 정보 추가하는 유틸리티 메서드
    public void addDetail(String field, String errorMessage) {
        if (this.details == null) {
            this.details = new java.util.HashMap<>();
        }
        this.details.put(field, errorMessage);
    }
}