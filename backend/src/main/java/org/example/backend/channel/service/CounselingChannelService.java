package org.example.backend.channel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.CounselingChannelCreateRequest;
import org.example.backend.channel.dto.response.CounselingChannelResponse;
import org.example.backend.channel.model.Channel;
import org.example.backend.channel.model.ChannelType;
import org.example.backend.channel.repository.ChannelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CounselingChannelService {

    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;

    /**
     * 상담 채널 생성
     *
     * @param userId 상담사 사용자 ID
     * @param request 채널 생성 요청 DTO
     * @return 생성된 채널 응답 DTO
     */
    @Transactional
    public CounselingChannelResponse createCounselingChannel(Long userId, CounselingChannelCreateRequest request) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 상담사 여부 확인
        Counselor counselor = counselorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

        // 최대 인원 검증 (일반 상담은 1명, 그룹 상담은 최대 3명)
        int maxPlayer = request.getMaxPlayer();
        if ("NORMAL".equals(request.getChannelType()) && maxPlayer != 1) {
            maxPlayer = 1; // 일반 상담은 항상 1명으로 고정
        } else if ("GROUP".equals(request.getChannelType()) && (maxPlayer < 1 || maxPlayer > 3)) {
            throw new IllegalArgumentException("그룹 상담은 최대 3명까지 가능합니다.");
        }

        // 채널 ID 생성 (UUID)
        String channelId = UUID.randomUUID().toString();

        // 채널 엔티티 생성
        Channel channel = Channel.builder()
                .channelId(channelId)
                .channelName(request.getChannelName())
                .maxPlayer(maxPlayer)
                .userId(userId) // 생성자(상담사) ID
                .counselorId(counselor.getId()) // 상담사 ID
                .channelType(ChannelType.COUNSELING)
                .password(null) // 상담 채널은 비밀번호 없음
                .description(request.getDescription())
                .build();

        // 채널 저장
        Channel savedChannel = channelRepository.save(channel);
        log.info("상담 채널 생성 완료: channelId={}, counselorId={}", channelId, counselor.getId());

        // 응답 DTO 반환
        return CounselingChannelResponse.from(savedChannel, user.getNickname());
    }

    /**
     * 상담사의 상담 채널 목록 조회
     *
     * @param userId 상담사 사용자 ID
     * @return 상담 채널 목록
     */
    @Transactional(readOnly = true)
    public List<CounselingChannelResponse> getCounselingChannelList(Long userId) {
        // 상담사 여부 확인
        Counselor counselor = counselorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

        // 상담사가 생성한 모든 상담 채널 조회
        List<Channel> channels = channelRepository.findByCounselorId(counselor.getId());

        // 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 응답 DTO 변환
        return channels.stream()
                .map(channel -> CounselingChannelResponse.from(channel, user.getNickname()))
                .collect(Collectors.toList());
    }
}