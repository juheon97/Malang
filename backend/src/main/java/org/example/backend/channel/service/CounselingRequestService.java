package org.example.backend.channel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.CounselorProfileRepository;
import org.example.backend.channel.dto.request.CounselingRequestDto;
import org.example.backend.channel.model.Channel;
import org.example.backend.channel.model.ChannelType;
import org.example.backend.channel.repository.ChannelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CounselingRequestService {

    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;
    private final CounselorProfileRepository counselorProfileRepository;

    /**
     * 상담 요청 생성 - 수정된 로직에서는 사용하지 않으나 호환성을 위해 유지
     * 기존 CounselingChannelService를 통해 방을 생성해야 함
     *
     * @param userId 요청 사용자 ID
     * @param request 상담 요청 정보
     * @return 생성된 상담 요청 정보
     */
    @Transactional
    public Map<String, Object> createCounselingRequest(Long userId, CounselingRequestDto request) {
        // 기존 API와의 호환성을 위해 유지
        // 이 메서드는 더 이상 사용하지 않으며, 상담사가 방을 생성해야 함
        log.warn("deprecatedApi: 이 API는 더 이상 사용되지 않습니다. 상담사가 방을 생성해야 합니다.");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "이 API는 더 이상 사용되지 않습니다. 상담사가 방을 생성해야 합니다.");
        return response;
    }

    /**
     * 상담사별 대기중인 상담 채널 목록 조회 (상태: 0)
     *
     * @param counselorId 상담사 ID
     * @return 대기중인 상담 채널 목록
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCounselingRequests(String counselorId) {
        // 해당 상담사의 대기중(0) 상태인 상담 채널 목록 조회
        List<Channel> waitingChannels = channelRepository.findByCounselorIdAndStatus(counselorId, 0);

        // 응답 데이터 생성
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (Channel channel : waitingChannels) {
            User creator = userRepository.findById(channel.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("채널 생성자 정보를 찾을 수 없습니다."));

            Map<String, Object> channelInfo = new HashMap<>();
            channelInfo.put("channelId", channel.getChannelId());
            channelInfo.put("channelName", channel.getChannelName());
            channelInfo.put("channelType", channel.getChannelName().startsWith("GROUP") ? "GROUP" : "NORMAL");
            channelInfo.put("createdAt", channel.getCreatedAt());
            channelInfo.put("scheduledTime", channel.getScheduledTime());
            channelInfo.put("description", channel.getDescription());

            responseList.add(channelInfo);
        }

        return responseList;
    }

    /**
     * 사용자가 참여 가능한 상담 채널 목록 조회 (상태: 0)
     *
     * @return
     * 가능한 상담 채널 목록
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableCounselingChannels() {
        // 대기중(0) 상태인 모든 상담 채널 목록 조회
        List<Channel> availableChannels = channelRepository.findByStatus(0);

        // 응답 데이터 생성
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (Channel channel : availableChannels) {
            // 상담사 정보 조회
            Counselor counselor = counselorRepository.findById(channel.getCounselorId())
                    .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

            User counselorUser = userRepository.findById(counselor.getUser().getId())
                    .orElseThrow(() -> new IllegalArgumentException("상담사 사용자 정보를 찾을 수 없습니다."));

            Map<String, Object> channelInfo = new HashMap<>();
            channelInfo.put("channelId", channel.getChannelId());
            channelInfo.put("channelName", channel.getChannelName());
            channelInfo.put("channelType", channel.getChannelName().startsWith("GROUP") ? "GROUP" : "NORMAL");
            channelInfo.put("counselorName", counselorUser.getNickname());
            channelInfo.put("counselorId", counselor.getId());
            channelInfo.put("createdAt", channel.getCreatedAt());
            channelInfo.put("scheduledTime", channel.getScheduledTime());
            channelInfo.put("description", channel.getDescription());

            responseList.add(channelInfo);
        }

        return responseList;
    }

    /**
     * 사용자의 상담 요청 - 채널 상태를 진행중(1)으로 변경
     *
     * @param channelId 채널 ID
     * @param userId 사용자 ID
     * @return 상담 요청 결과
     */
    @Transactional
    public Map<String, Object> requestCounseling(String channelId, Long userId) {
        // 채널 존재 확인
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("채널을 찾을 수 없습니다."));

        // 채널이 상담 타입인지 확인
        if (channel.getCategory() != 1) { // 1 = 상담 채널
            throw new IllegalArgumentException("유효한 상담 채널이 아닙니다.");
        }

        // 상태가 대기중(0)인지 확인
        if (channel.getStatus() != 0) {
            throw new IllegalArgumentException("요청 가능한 상태가 아닙니다.");
        }

        // 상태를 진행중(1)으로 변경
        channel.updateStatus(1);
        channelRepository.save(channel);

        log.info("상담 요청 완료: channelId={}, userId={}, 상태=진행중(1)",
                channel.getChannelId(), userId);

        // 응답 데이터 생성
        Map<String, Object> response = new HashMap<>();
        response.put("channelId", channel.getChannelId());
        response.put("status", "in_progress");
        response.put("message", "상담 요청이 성공적으로 처리되었습니다.");

        return response;
    }

    /**
     * 상담 종료 - 채널 상태를 종료됨(2)으로 변경
     *
     * @param channelId 채널 ID
     * @param counselorId 상담사 ID (권한 확인용)
     * @return 종료된 채널 정보
     */
    @Transactional
    public Map<String, Object> endCounseling(String channelId, String counselorId) {
        // 채널 존재 확인
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("채널을 찾을 수 없습니다."));

        // 채널이 상담 타입인지 확인
        if (channel.getCategory() != 1) { // 1 = 상담 채널
            throw new IllegalArgumentException("유효한 상담 채널이 아닙니다.");
        }

        // 해당 상담사의 요청인지 확인
        if (!counselorId.equals(channel.getCounselorId())) {
            throw new IllegalArgumentException("해당 상담사에게 요청된 상담이 아닙니다.");
        }

        // 상태가 진행중(1)인지 확인
        if (channel.getStatus() != 1) {
            throw new IllegalArgumentException("종료 가능한 상태가 아닙니다.");
        }

        // 상태를 종료됨(2)으로 변경
        channel.updateStatus(2);
        channelRepository.save(channel);

        // 상담사 프로필 상태 업데이트 (0: 대기/사용 가능)
        CounselorProfile profile = counselorProfileRepository.findById(counselorId)
                .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));
        profile.updateStatus(0); // 상태를 '대기 중'으로 변경
        counselorProfileRepository.save(profile);

        log.info("상담 종료 완료 및 상담사 상태 업데이트: channelId={}, counselorId={}, 상태=종료됨(2), 상담사상태=0",
                channel.getChannelId(), counselorId);

        // 응답 데이터 생성
        Map<String, Object> response = new HashMap<>();
        response.put("channelId", channel.getChannelId());
        response.put("status", "completed");
        response.put("message", "상담이 종료되었습니다.");

        return response;
    }
}