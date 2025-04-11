package org.example.backend.community.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityGetListsResponse {
    private Integer total_count;
    private Integer current_page;
    private Integer total_pages;
    private List<ArticleInfo> articles;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArticleInfo {
        private Integer article_id;
        private String category;
        private String title;
        private LocalDateTime created_at;
        private Integer likes;
    }
}
