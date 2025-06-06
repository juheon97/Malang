package org.example.backend.auth.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CounselorSignupRequest extends SignupRequest {

    @NotBlank(message = "이름은 필수 입력 항목입니다.")
    @Size(min = 2, max = 50, message = "이름은 2~50자 사이어야 합니다.")
    private String name;

    @NotBlank(message = "성별은 필수 입력 항목입니다.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M(남성) 또는 F(여성)으로 입력해야 합니다.")
    private String gender;

    @NotNull(message = "생년월일(년)은 필수 입력 항목입니다.")
    private Integer birthYear;

    @NotNull(message = "생년월일(월)은 필수 입력 항목입니다.")
    @Min(value = 1, message = "월은 1~12 사이여야 합니다.")
    @Max(value = 12, message = "월은 1~12 사이여야 합니다.")
    private Integer birthMonth;

    @NotNull(message = "생년월일(일)은 필수 입력 항목입니다.")
    @Min(value = 1, message = "일은 1~31 사이여야 합니다.")
    @Max(value = 31, message = "일은 1~31 사이여야 합니다.")
    private Integer birthDay;

    @NotNull(message = "자격증 여부는 필수 입력 항목입니다.")
    private Boolean hasCertification;

    // 모든 필드를 매개변수로 받는 생성자
    public CounselorSignupRequest(String email, String password, String nickname, String profileUrl,
                                  String name, String gender, Integer birthYear, Integer birthMonth,
                                  Integer birthDay, Boolean hasCertification) {
        super(email, password, nickname, profileUrl, null);
        this.name = name;
        this.gender = gender;
        this.birthYear = birthYear;
        this.birthMonth = birthMonth;
        this.birthDay = birthDay;
        this.hasCertification = hasCertification;
    }

    // 생년월일을 LocalDateTime으로 변환하는 메서드
    public LocalDateTime getBirthdate() {
        return LocalDateTime.of(birthYear, birthMonth, birthDay, 0, 0);
    }

    // 자격증 정보를 문자열로 변환 (Y/N)
    public String getCertificationString() {
        return hasCertification ? "Y" : "N";
    }

    @Override
    public String toString() {
        return "CounselorSignupRequest{" +
                "email='" + getEmail() + '\'' +
                ", password='[PROTECTED]'" +
                ", nickname='" + getNickname() + '\'' +
                ", profileUrl='" + getProfileUrl() + '\'' +
                ", name='" + name + '\'' +
                ", gender='" + gender + '\'' +
                ", birthYear=" + birthYear +
                ", birthMonth=" + birthMonth +
                ", birthDay=" + birthDay +
                ", hasCertification=" + hasCertification +
                '}';
    }
}