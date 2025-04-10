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

    @Column(name = "json_s3_key")
    private String jsonS3Key;

    @Column(name = "text_s3_key")
    private String textS3Key;

    @Column(name = "masked_text_s3_key")
    private String maskedTextS3Key;

    private LocalDateTime uploadedAt;
}
