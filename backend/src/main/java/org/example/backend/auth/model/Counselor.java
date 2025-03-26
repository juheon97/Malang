package org.example.backend.auth.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.backend.common.entity.BaseTimeEntity;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "Counselor")
public class Counselor {

    @Id
    @Column(name = "counselor_id", length = 36)
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "counselor_name", length = 50, nullable = false)
    private String name;

    @Column(name = "counselor_gender", length = 1, nullable = false)
    private String gender;

    @Column(name = "counselor_birthdate", nullable = false)
    private LocalDateTime birthdate;

    @Builder
    public Counselor(String id, User user, String name, String gender, LocalDateTime birthdate) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.gender = gender;
        this.birthdate = birthdate;
    }
}