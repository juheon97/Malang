package org.example.backend.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.backend.common.entity.BaseTimeEntity;


@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private long id;

    @Column(name = "user_email", nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "profile_url")
    private String profileUrl;

    @Column(name = "role", nullable = false)
    private String role; // "ROLE_USER" 또는 "ROLE_COUNSELOR"

    @Column(name = "user_nickname", nullable = false)
    private String nickname;

    // 시각장애 여부 필드 추가
    @Column(name = "disability_status")
    private Boolean disabilityStatus;


    @Builder
    public User(String email, String password, String profileUrl, String role, String nickname, Boolean disabilityStatus) {
        this.email = email;
        this.password = password;
        this.profileUrl = profileUrl;
        this.role = role;
        this.nickname = nickname;
        this.disabilityStatus = disabilityStatus;
    }

    public void updateProfile(String profileUrl, String nickname) {
        this.profileUrl = profileUrl;
        this.nickname = nickname;
    }

    public static User of(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
