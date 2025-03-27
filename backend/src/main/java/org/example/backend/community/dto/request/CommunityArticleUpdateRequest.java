package org.example.backend.community.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityArticleUpdateRequest {

    private String community_category;
    private String title;
    private String content;
    private Integer user_id;

}
