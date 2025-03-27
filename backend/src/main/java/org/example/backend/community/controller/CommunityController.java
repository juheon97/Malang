package org.example.backend.community.controller;


import lombok.RequiredArgsConstructor;
import org.example.backend.community.dto.request.CommunityCreateRequest;
import org.example.backend.community.dto.response.CommunityCreateResponse;
import org.example.backend.community.service.CommunityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
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

        // JWT 토큰이 준비 되면 진행
        // Long userId = jwtTokenProvider.getUserIdFromToken();
        Long userId = null;

        Map<String, Object> response = communityService.getArticleById(articleId, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/article/{articleId}")
    public ResponseEntity<?> deleteArticle(@PathVariable Integer articleId) {
        communityService.deleteArticle(articleId);
        return ResponseEntity.ok().body("Deleted article " + articleId);
    }
}
