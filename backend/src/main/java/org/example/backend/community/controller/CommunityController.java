package org.example.backend.community.controller;


import lombok.RequiredArgsConstructor;
import org.example.backend.common.exception.ErrorResponse;
import org.example.backend.community.dto.request.CommunityArticleUpdateRequest;
import org.example.backend.community.dto.request.CommunityCreateRequest;
import org.example.backend.community.dto.response.CommunityArticleUpdateResponse;
import org.example.backend.community.dto.response.CommunityCreateResponse;
import org.example.backend.community.service.CommunityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
@Tag(name = "커뮤니티")
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createArticle(@RequestBody CommunityCreateRequest request) {
        CommunityCreateResponse createResponse = communityService.createCommunity(request);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", createResponse);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/get/latest")
    public ResponseEntity<Map<String, Object>> getLatestArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = communityService.getLatestArticles(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get/oldest")
    public ResponseEntity<Map<String, Object>> getOldestArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = communityService.getOldestArticles(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get/{category}")
    public ResponseEntity<Map<String, Object>> getArticlesByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = communityService.getArticlesByCategory(category, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/article/{articleId}")
    public ResponseEntity<Map<String, Object>> getArticleById(@PathVariable Integer articleId) {

        Long userId = null;

        Map<String, Object> response = communityService.getArticleById(articleId, userId);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/article/{articleId}")
    public ResponseEntity<?> updateArticle(
            @PathVariable Integer articleId,
            @RequestBody CommunityArticleUpdateRequest request) {

        try {
            // 서비스 호출하여 게시글 업데이트
            CommunityArticleUpdateResponse updateResponse = communityService.updateArticle(articleId, request);

            // 응답 데이터 구성
            Map<String, Object> dataMap = new HashMap<>();
            dataMap.put("article", updateResponse);

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("status", "success");
            responseMap.put("data", dataMap);

            return ResponseEntity.ok(responseMap);

        } catch (IllegalArgumentException e) {
            // HTTP 상태 코드를 직접 사용
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.FORBIDDEN.value(), e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (Exception e) {
            // HTTP 상태 코드를 직접 사용
            ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "게시글 업데이트 중 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @DeleteMapping("/article/{articleId}")
    public ResponseEntity<?> deleteArticle(@PathVariable Integer articleId) {
        try {
            communityService.deleteArticle(articleId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Deleted article " + articleId);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ErrorResponse errorResponse = new ErrorResponse(HttpStatus.FORBIDDEN.value(), e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "게시글 삭제 중 오류가 발생했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
