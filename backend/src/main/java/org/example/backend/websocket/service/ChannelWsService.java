package org.example.backend.websocket.service;



import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.Session;
import org.example.backend.auth.controller.CounselorProfileController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.example.backend.channel.service.VoiceChannelService; // 기존 voice 채널 서비스 가정
import lombok.RequiredArgsConstructor;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChannelWsService {

    private final StringRedisTemplate redisTemplate;
    private final VoiceChannelService voiceChannelService; // 기존 서비스 주입
    private final OpenVidu openvidu;

    @Autowired
    private final CounselorProfileController counselorProfileController;

    private static final Logger logger = LoggerFactory.getLogger(ChannelWsService.class);

    /**
     * 사용자를 채널에 입장시킵니다.
     */
    public void joinChannel(Long channelId, Long userId) {
        logger.debug("Joining channel: channelId={}, userId={}", channelId, userId);

        String channelKey = "channel:" + channelId + ":users";
        try {
            redisTemplate.opsForSet().add(channelKey, userId.toString());
            logger.debug("Successfully added user to channel in Redis");
        } catch (Exception e) {
            logger.error("Failed to add user to channel in Redis", e);
        }
    }

    /**
     * 사용자를 채널에서 퇴장시킵니다.
     * 만약 채널이 비었다면 채널을 삭제합니다.
     */
    public void leaveChannel(Long channelId, Long userId) {
        String channelKey = "channel:" + channelId + ":users";
        redisTemplate.opsForSet().remove(channelKey, userId.toString());

        // 채널에 남은 사용자 수 확인
        Long remainingUsers = redisTemplate.opsForSet().size(channelKey);

        // 사용자가 없으면 채널 삭제 및 OpenVidu 세션 정리
        if (remainingUsers != null && remainingUsers == 0) {
            deleteEmptyChannel(channelId);

            // OpenVidu 세션 정리
            try {
                // 채널 ID를 세션 ID로 사용한다고 가정
                String sessionId = channelId.toString();
                Session session = openvidu.getActiveSession(sessionId);
                if (session != null) {
                    session.close();
                    logger.info("OpenVidu 세션 삭제 완료: {}", sessionId);
                }
            } catch (Exception e) {
                logger.error("OpenVidu 세션 삭제 중 오류 발생: {}", e.getMessage());
            }
        }
    }
    public void counselStatusChange(Long userId) {
        try {
            counselorProfileController.updateStatusIntoZero();
            logger.info("Counselor status changed to 0 (busy) for userId={}", userId);
        } catch (Exception e) {
            logger.error("Failed to change counselor status: {}", e.getMessage());
        }
    }

    /**
     * 비어있는 채널을 삭제합니다.
     */
    private void deleteEmptyChannel(Long channelId) {
        // Redis에서 채널 관련 데이터 삭제
        String channelKey = "channel:" + channelId + ":users";
        redisTemplate.delete(channelKey);

        // 기존 voice 채널 서비스의 삭제 메서드 호출
        voiceChannelService.deleteVoiceChannel(Long.valueOf(channelId.toString()));
    }

    /**
     * 채널의 현재 사용자 목록을 가져옵니다.
     */
    public Set<String> getChannelUsers(Long channelId) {
        String channelKey = "channel:" + channelId + ":users";
        return redisTemplate.opsForSet().members(channelKey);
    }
}