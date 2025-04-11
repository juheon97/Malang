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
public class CommunityArticleUpdateResponse {

    private Integer article_id;
    private LocalDateTime updated_at;
}
