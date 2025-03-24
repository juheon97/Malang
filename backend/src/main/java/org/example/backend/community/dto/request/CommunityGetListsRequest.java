package org.example.backend.community.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityGetListsRequest {
    private Integer page;
    private Integer size;
    private String category;
    private String sort;
}
