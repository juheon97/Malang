package org.example.backend.channel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.VoiceChannelCreateRequest;
import org.example.backend.channel.dto.response.VoiceChannelResponse;
import org.example.backend.channel.model.Channel;
import org.example.backend.channel.model.ChannelType;
import org.example.backend.channel.repository.ChannelRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceChannelService {

    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 음성 채널 생성
     *
     * @param userId 생성자 ID
     * @param request 채널 생성 요청 DTO
     * @return 생성된 채널 응답 DTO
     */
    @Transactional
    public VoiceChannelResponse createVoiceChannel(Long userId, VoiceChannelCreateRequest request) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 채널 ID 생성 (UUID)
        String channelId = UUID.randomUUID().toString();

        // 비밀번호 암호화 (설정된 경우)
        String encodedPassword = null;
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            encodedPassword = passwordEncoder.encode(request.getPassword());
        }

        // 채널 엔티티 생성 - 음성 채널은 counselorId가 null
        Channel channel = Channel.builder()
                .channelId(channelId)
                .channelName(request.getChannelName())
                .maxPlayer(request.getMaxPlayer())
                .userId(userId)
                .counselorId(null) // 음성 채널은 상담사 ID가 필요 없음
                .channelType(ChannelType.VOICE)
                .password(encodedPassword)
                .description(request.getDescription())
                .build();

        // 채널 저장
        Channel savedChannel = channelRepository.save(channel);
        log.info("음성 채널 생성 완료: channelId={}, userId={}", channelId, userId);

        // 응답 DTO 반환
        return VoiceChannelResponse.from(savedChannel, user.getNickname());
    }

    /**
     * 음성 채널 목록 조회
     *
     * @return 음성 채널 목록
     */
    @Transactional(readOnly = true)
    public List<VoiceChannelResponse> getVoiceChannelList() {
        // 음성 채널 타입에 해당하는 모든 채널 조회
        List<Channel> channels = channelRepository.findByCategory(0); // VOICE = 0

        // 각 채널의 생성자 닉네임 조회 및 응답 DTO 변환
        return channels.stream()
                .map(channel -> {
                    String creatorNickname = userRepository.findById(channel.getUserId())
                            .map(User::getNickname)
                            .orElse("알 수 없음");

                    return VoiceChannelResponse.from(channel, creatorNickname);
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 음성 채널 조회
     *
     * @param channelId 채널 ID
     * @return 채널 응답 DTO
     */
    @Transactional(readOnly = true)
    public VoiceChannelResponse getVoiceChannel(String channelId) {
        // 채널 ID로 채널 조회
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("채널을 찾을 수 없습니다."));

        // 음성 채널 타입 검증
        if (channel.getCategory() != 0) { // VOICE = 0
            throw new IllegalArgumentException("요청한 채널은 음성 채널이 아닙니다.");
        }

        // 생성자 닉네임 조회
        String creatorNickname = userRepository.findById(channel.getUserId())
                .map(User::getNickname)
                .orElse("알 수 없음");

        // 응답 DTO 반환
        return VoiceChannelResponse.from(channel, creatorNickname);
    }

    /**
     * 채널 비밀번호 확인
     *
     * @param channelId 채널 ID
     * @param password 입력한 비밀번호
     * @return 비밀번호 일치 여부
     */
    @Transactional(readOnly = true)
    public boolean checkChannelPassword(String channelId, String password) {
        // 채널 조회
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("채널을 찾을 수 없습니다."));

        // 비밀번호가 설정되어 있지 않으면 true 반환
        if (channel.getPassword() == null || channel.getPassword().isEmpty()) {
            return true;
        }

        // 비밀번호 일치 여부 확인
        return passwordEncoder.matches(password, channel.getPassword());
    }
}