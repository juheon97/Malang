package org.example.backend.localllm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "summary")
public class Summary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long summaryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 일반 사용자 중 role 필드로 일반 유조 추가 구분함

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "counselor_user_id", nullable = false)
    private User counselor; // 일반 사용자 중 role 필드로 상담사 추가 구분함

    @Column(columnDefinition = "TEXT")
    private String summaryTopic;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String counselorNote;

    private LocalDateTime nextSchedule;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
