package org.example.backend.community.service;

import org.example.backend.community.dto.request.CommunityCreateRequest;
import org.example.backend.community.dto.response.CommunityCreateResponse;

import java.util.Map;

public interface CommunityService {

    CommunityCreateResponse createCommunity(CommunityCreateRequest request);

    Map<String, Object> getLatestArticles(int page, int size);
    Map<String, Object> getOldestArticles(int page, int size);
    Map<String, Object> getArticlesByCategory(String category, int page, int size);
    Map<String, Object> getArticleById(Integer articleId, Long userId);
    boolean deleteArticle(Integer articleId, Long userId);

}
