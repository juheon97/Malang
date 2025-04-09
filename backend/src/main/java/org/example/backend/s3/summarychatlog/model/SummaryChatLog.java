package org.example.backend.s3.summarychatlog.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "summarychatlog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummaryChatLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long counselorId;
    private Long channelId;

    private String jsonS3Key;
    private String textS3Key;

    private LocalDateTime uploadedAt;
}
