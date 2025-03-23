package org.example.backend.community.controller;


import lombok.RequiredArgsConstructor;
import org.example.backend.community.dto.request.CommunityCreateRequest;
import org.example.backend.community.dto.response.CommunityCreateResponse;
import org.example.backend.community.service.CommunityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/write")
    public ResponseEntity<Map<String, Object>> createArticle(@RequestBody CommunityCreateRequest request) {
        CommunityCreateResponse createResponse = communityService.createCommunity(request);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", createResponse);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
