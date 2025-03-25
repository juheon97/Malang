package org.example.backend.auth.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.backend.common.entity.BaseTimeEntity;


@Entity
@Getter
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
    private String role;

    @Column(name = "user_nickname", nullable = false)
    private String nickname;

    @Builder
    public User(String email, String password, String profileUrl, String role, String nickname) {
        this.email = email;
        this.password = password;
        this.profileUrl = profileUrl;
        this.role = role;
        this.nickname = nickname;
    }

    public void updateProfile(String profileUrl, String nickname) {
        this.profileUrl = profileUrl;
        this.nickname = nickname;
    }
}
