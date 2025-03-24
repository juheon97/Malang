package org.example.backend.community.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityGetArticleResponse {
    private Integer article_id;
    private String category;
    private String title;
    private LocalDateTime created_at;
    private Long user_id;
    private Integer likes;
    private Boolean is_liked;
}
