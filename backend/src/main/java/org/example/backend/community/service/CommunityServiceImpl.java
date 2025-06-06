package org.example.backend.community.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.community.dto.request.CommunityArticleUpdateRequest;
import org.example.backend.community.dto.request.CommunityCreateRequest;
import org.example.backend.community.dto.response.CommunityArticleUpdateResponse;
import org.example.backend.community.dto.response.CommunityCreateResponse;
import org.example.backend.community.dto.response.CommunityGetArticleResponse;
import org.example.backend.community.dto.response.CommunityGetListsResponse;
import org.example.backend.community.model.Community;
import org.example.backend.community.repository.CommunityRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;

    @Override
    @Transactional
    public CommunityCreateResponse createCommunity(CommunityCreateRequest request) {
        Community community = Community.builder()
                .communityCategory(request.getCommunity_category())
                .title(request.getTitle())
                .content(request.getContent())
                .userId(request.getUser_id())
                // likes를 0으로 설정 후 생성
                .likes(0)
                .build();

        Community savedCommunity = communityRepository.save(community);

        return new CommunityCreateResponse(
                savedCommunity.getArticleId(),
                savedCommunity.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getLatestArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size); // 페이지는 0부터 시작하므로 1을 빼줌
        Page<Community> communityPage = communityRepository.findAllOrderByCreatedAtDesc(pageable);

        return createResponseMap(communityPage, page);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOldestArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Community> communityPage = communityRepository.findAllOrderByCreatedAtAsc(pageable);

        return createResponseMap(communityPage, page);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getArticlesByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Community> communityPage = communityRepository.findByCategory(category, pageable);

        return createResponseMap(communityPage, page);
    }

    @Override
    public Map<String, Object> getArticleById(Integer articleId, Long userId) {
        // 게시글 조회
        Community community = communityRepository.findByArticleId(articleId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다. ID: " + articleId));

        // 응답 DTO 생성 - Builder 패턴 사용
        CommunityGetArticleResponse articleResponse = CommunityGetArticleResponse.builder()
                .article_id(community.getArticleId())
                .category(community.getCommunityCategory())
                .title(community.getTitle())
                .content(community.getContent())
                .created_at(community.getCreatedAt())
                .user_id(community.getUserId())
                .likes(community.getLikes())
                .build();

        // 중첩 Map 구조로 응답 생성
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("article", articleResponse);
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("status", "success");
        responseMap.put("data", dataMap);

        return responseMap;
    }

    @Override
    @Transactional
    public boolean deleteArticle(Integer articleId) {
        Community community = communityRepository.findById(articleId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));

        communityRepository.deleteById(articleId);
        return true;
    }

    @Override
    @Transactional
    public CommunityArticleUpdateResponse updateArticle(Integer articleId, CommunityArticleUpdateRequest request) {
        // 게시글이 존재하는지 확인
        Community community = communityRepository.findByArticleId(articleId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다. ID: " + articleId));

        // 업데이트 실행
        int updatedCount = communityRepository.updateByArticleIdAndUserId(
                articleId,
                request.getCommunity_category(),
                request.getTitle(),
                request.getContent(),
                Long.valueOf(request.getUser_id())
        );

        // 업데이트가 성공했는지 확인
        if (updatedCount == 0) {
            throw new IllegalArgumentException("게시글 업데이트에 실패했습니다. 작성자만 수정할 수 있습니다.");
        }

        // 현재 시간 기준으로 응답 생성
        return CommunityArticleUpdateResponse.builder()
                .article_id(articleId)
                .updated_at(LocalDateTime.now())
                .build();
    }

    // 공통 응답 맵 생성 메서드
    private Map<String, Object> createResponseMap(Page<Community> communityPage, int requestedPage) {
        List<CommunityGetListsResponse.ArticleInfo> articles = communityPage.getContent().stream()
                .map(this::convertToArticleInfo)
                .collect(Collectors.toList());

        CommunityGetListsResponse listResponse = CommunityGetListsResponse.builder()
                .total_count((int) communityPage.getTotalElements())
                .current_page(requestedPage)
                .total_pages(communityPage.getTotalPages())
                .articles(articles)
                .build();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", listResponse);

        return response;
    }

    // Community 엔티티를 ArticleInfo DTO로 변환
    private CommunityGetListsResponse.ArticleInfo convertToArticleInfo(Community community) {
        return CommunityGetListsResponse.ArticleInfo.builder()
                .article_id(community.getArticleId())
                .category(community.getCommunityCategory())
                .title(community.getTitle())
                .created_at(community.getCreatedAt())
                .likes(community.getLikes())
                .build();
    }

}
