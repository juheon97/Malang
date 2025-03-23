package org.example.backend.community.service;


import lombok.RequiredArgsConstructor;
import org.example.backend.community.dto.request.CommunityCreateRequest;
import org.example.backend.community.dto.response.CommunityCreateResponse;
import org.example.backend.community.model.Community;
import org.example.backend.community.repository.CommunityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;

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

}
