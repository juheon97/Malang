package org.example.backend.auth.model;

public enum Role { // Role 열거형이고 미리 정의된 상수 집합이며 사용자 역할을 제한된 값만 가지도록 보장함.
    // 일반 사용자 역할
    ROLE_USER("ROLE_USER"), // Spring Security 가 권한을 인식하는 데 사용.

    // 상담사 역할
    ROLE_COUNSELOR("ROLE_COUNSELOR"); // 상담 관련 기능에 접근 할 수 있는 권한.

    private final String value;

    Role(String value) { // 열거형 상수 생성될 때 자도응로 호출되어 value 필드 초기화.
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromValue(String value) { // 문자열로부터 열거형 상수를 찾는 정적 메소드.
        for (Role role : Role.values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        return null;
    }
}