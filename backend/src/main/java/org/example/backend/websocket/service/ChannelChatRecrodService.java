package org.example.backend.websocket.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChannelChatRecrodService {
    private static final Logger logger = LoggerFactory.getLogger(ChannelChatRecrodService.class);
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 상담 시작 시 새로운 채팅 요약 초기화
     * @param channelId 채널 ID
     */
    public void initializeChatSummary(Long channelId) {
        // 채널에 참여한 사용자와 상담사 ID 가져오기
        Map<String, Long> participants = getChannelParticipants(channelId);
        Long userId = participants.get("userId");
        Long counselorUserId = participants.get("counselorUserId");

        if (userId == null || counselorUserId == null) {
            logger.warn("상담 요약 초기화 실패: 사용자 ID 또는 상담사 ID를 찾을 수 없습니다. channelId={}", channelId);
            return;
        }

        // 요약 데이터 생성
        Map<String, Object> summaryData = new HashMap<>();
        summaryData.put("userId", userId);
        summaryData.put("counselorUserId", counselorUserId);
        summaryData.put("channelId", channelId.toString());
        summaryData.put("messages", new ArrayList<Map<String, String>>());

        try {
            // JSON 문자열로 변환하여 Redis에 저장
            String summaryJson = objectMapper.writeValueAsString(summaryData);
            String summaryKey = getSummaryKey(channelId);
            redisTemplate.opsForValue().set(summaryKey, summaryJson);
            logger.info("상담 요약이 초기화되었습니다: channelId={}", channelId);
        } catch (JsonProcessingException e) {
            logger.error("상담 요약 초기화 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 채팅 메시지를 요약에 추가
     * @param channelId 채널 ID
     * @param role 메시지 작성자 역할 (user 또는 counselor)
     * @param content 메시지 내용
     */
    public void addMessageToSummary(Long channelId, String role, String content, LocalDateTime currentTime) {
        String summaryKey = getSummaryKey(channelId);
        String summaryJson = redisTemplate.opsForValue().get(summaryKey);

        if (summaryJson == null) {
            logger.warn("채팅 요약을 찾을 수 없습니다: channelId={}", channelId);
            return;
        }

        try {
            // 기존 요약 데이터 가져오기
            Map<String, Object> summaryData = objectMapper.readValue(summaryJson, Map.class);
            List<Map<String, String>> messages = (List<Map<String, String>>) summaryData.get("messages");

            // 새 메시지 추가
            Map<String, String> newMessage = new HashMap<>();
            newMessage.put("role", role);
            newMessage.put("content", content);
            newMessage.put("currentTime", currentTime.toString());
            messages.add(newMessage);

            // 업데이트된 요약 저장
            summaryJson = objectMapper.writeValueAsString(summaryData);
            redisTemplate.opsForValue().set(summaryKey, summaryJson);
            logger.debug("메시지가 상담 요약에 추가되었습니다: channelId={}, role={}", channelId, role);
        } catch (JsonProcessingException e) {
            logger.error("메시지 추가 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 채널에 참여한 사용자와 상담사 ID 가져오기
     * @param channelId 채널 ID
     * @return userID와 counselorUserId를 포함한 Map
     */
    private Map<String, Long> getChannelParticipants(Long channelId) {
        Map<String, Long> participants = new HashMap<>();
        String channelKey = "channel:" + channelId + ":users";
        Set<String> members = redisTemplate.opsForSet().members(channelKey);

        if (members == null || members.isEmpty()) {
            logger.warn("채널에 참여자가 없습니다: channelId={}", channelId);
            return participants;
        }

        // 사용자와 상담사 ID 분리 (상담사 ID는 1000 이상)
        for (String memberId : members) {
            Long id = Long.parseLong(memberId);
            if (id >= 1000) {
                participants.put("counselorUserId", id);
            } else {
                participants.put("userId", id);
            }
        }

        return participants;
    }

    /**
     * 요약 데이터 가져오기
     * @param channelId 채널 ID
     * @return 요약 데이터 (JSON 문자열)
     */
    public String getChatSummary(Long channelId) {
        String summaryKey = getSummaryKey(channelId);
        return redisTemplate.opsForValue().get(summaryKey);
    }

    /**
     * 요약 키 생성
     * @param channelId 채널 ID
     * @return Redis 요약 키
     */
    private String getSummaryKey(Long channelId) {
        return "counsel:" + channelId + ":summary";
    }
}