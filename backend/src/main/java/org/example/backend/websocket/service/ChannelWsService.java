package org.example.backend.websocket.service;



import com.fasterxml.jackson.databind.ObjectMapper;
import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.Session;
import org.example.backend.auth.controller.CounselorProfileController;
import org.example.backend.auth.service.AuthService;
import org.example.backend.auth.service.UserInfoService;
import org.example.backend.localllm.dto.request.SummaryRequest;
import org.example.backend.localllm.dto.response.SummaryResponse;
import org.example.backend.localllm.service.SummaryService;
import org.example.backend.s3.S3Uploader;
import org.example.backend.s3.summarychatlog.service.SummaryChatLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.example.backend.channel.service.VoiceChannelService; // 기존 voice 채널 서비스 가정
import lombok.RequiredArgsConstructor;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;


import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChannelWsService {

    private final StringRedisTemplate redisTemplate;
    private final VoiceChannelService voiceChannelService; // 기존 서비스 주입
    private final OpenVidu openvidu;

    @Autowired
    private final CounselorProfileController counselorProfileController;
    private final ChannelChatRecrodService channelChatRecrodService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final SummaryService summaryService;

    private final S3Uploader s3Uploader;

    private static final Logger logger = LoggerFactory.getLogger(ChannelWsService.class);

    @Autowired
    private UserInfoService userInfoService;

    @Autowired
    private SummaryChatLogService summaryChatLogService;

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
//    public void counselStatusChange(Long userId) {
//        try {
//            counselorProfileController.updateStatusIntoZero();
//            logger.info("Counselor status changed to 0 (busy) for userId={}", userId);
//        } catch (Exception e) {
//            logger.error("Failed to change counselor status: {}", e.getMessage());
//        }
//    }

    /**
     * 상담사 전용 방 Redis 방 상담 유저 저장기능
     */
    public void CounselorJoin(Long userId, Long counselCode) {
        String channelKey = "channel:" + counselCode + ":users";
        Long counselorId = counselorProfileController.getCounselorId(userId);

        try {
            redisTemplate.opsForSet().add(channelKey, counselorId.toString());
            logger.debug("Successfully added counselor to counselCode in Redis");
        } catch (Exception e) {
            logger.error("Failed to add counselor to counselCode in Redis", e);
        }
    }

    /**
     * 상담사 전용 방 Redis 방 일반유저 저장기능
     */

    public void UserCounselorJoin(Long userId, Long counselCode) {
        String channelKey = "channel:" + counselCode + ":users";

        try {
            redisTemplate.opsForSet().add(channelKey, userId.toString());
            logger.debug("Successfully added user to counselCode in Redis");
        } catch (Exception e) {
            logger.error("Failed to add user to counselCode in Redis", e);
        }
    }

    /**
     * 상담사 전용 방 Redis 방 일반유저 삭제 기능
     */

    public void UserCounselorLeave(Long userId, Long counselCode) {
        String channelKey = "channel:" + counselCode + ":users";
        redisTemplate.opsForSet().remove(channelKey, userId.toString());
    }

    /**
     * 상담사 전용 방 Redis 방 삭제 기능
     */

    public void CounselorLeave(Long counselCode) {
        String channelKey = "channel:" + counselCode + ":users";
        redisTemplate.delete(channelKey);

        // OpenVidu 세션 정리
        try {
            // 채널 ID를 세션 ID로 사용한다고 가정
            String sessionId = counselCode.toString();
            Session session = openvidu.getActiveSession(sessionId);
            if (session != null) {
                session.close();
                logger.info("OpenVidu 세션 삭제 완료: {}", sessionId);
            }
        } catch (Exception e) {
            logger.error("OpenVidu 세션 삭제 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 요약 데이터를 가져와서 SummaryController로 전송 후 Redis에서 삭제
     */
    public void sendSummaryRequest(Long channelId) {
        try {
            // Redis에서 채팅 요약 데이터 가져오기
            String summaryJson = channelChatRecrodService.getChatSummary(channelId);
            if (summaryJson == null) {
                logger.warn("채팅 요약을 찾을 수 없습니다: channelId={}", channelId);
                return;
            }

            // JSON 문자열을 Map으로 변환
            Map<String, Object> summaryData = objectMapper.readValue(summaryJson, Map.class);

            // SummaryRequest 객체 생성
            SummaryRequest summaryRequest = new SummaryRequest();
            // Long 타입 변환
            Number userId = (Number) summaryData.get("userId");
            summaryRequest.setUserId(userId != null ? userId.longValue() : null);
            Number counselorId = (Number) summaryData.get("counselorId");
            summaryRequest.setCounselorId(counselorId != null ? counselorId.longValue() : null);

            summaryRequest.setChannelId(channelId);
            summaryRequest.setMessages((java.util.List<Map<String, String>>) summaryData.get("messages"));

            // ========== S3에 JSON 원본 업로드 ==========
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH-mm-ss"));

            String jsonKey = String.format("summarylogs/json/counselor_%d_user_%d_%s.json.txt", counselorId, userId, timestamp);
            File jsonFile = File.createTempFile("summary_json_", ".txt");
            Files.writeString(jsonFile.toPath(), summaryJson, StandardCharsets.UTF_8);
            String jsonS3Url = s3Uploader.uploadPrivateFile(jsonFile, jsonKey);
            logger.info("JSON 요약 데이터 S3 업로드 완료: {}", jsonS3Url);

            // 사람이 보기 쉬운 텍스트 버전도 동일한 방식
            String textKey = String.format("summarylogs/text/counselor_%d_user_%d_%s.txt", counselorId, userId, timestamp);
            File textFile = File.createTempFile("summary_human_", ".txt");
            Files.writeString(textFile.toPath(), formatSummaryForText(summaryRequest), StandardCharsets.UTF_8);
            String textS3Url = s3Uploader.uploadPrivateFile(textFile, textKey);
            logger.info("포맷된 텍스트 요약 S3 업로드 완료: {}", textS3Url);

            // 3. 이제 DB에 로그 저장!
            summaryChatLogService.saveLog(userId.longValue(), counselorId.longValue(), channelId, jsonKey, textKey);

            // HTTP 요청 헤더 설정
//      HttpHeaders headers = new HttpHeaders();
//      headers.setContentType(MediaType.APPLICATION_JSON);
//
//      // HTTP 요청 생성
//      HttpEntity<SummaryRequest> request = new HttpEntity<>(summaryRequest, headers);

            try {
                // 요청 전송
//          restTemplate.postForEntity("/summary", request, Void.class);

                SummaryResponse response = summaryService.summarizeAndSave(summaryRequest, summaryRequest.getCounselorId());
                // 요청 성공 시 Redis에서 요약 데이터 삭제
                String summaryKey = "counsel:" + channelId + ":summary";
                redisTemplate.delete(summaryKey);

                logger.info("요약 요청이 성공적으로 전송되었고, Redis에서 요약 데이터가 삭제되었습니다: channelId={}", channelId);

            } catch (Exception e) {
                logger.error("요약 요청 전송 중 오류 발생: {}", e.getMessage());
            }
        } catch (JsonProcessingException e) {
            logger.error("요약 요청 처리 중 오류 발생: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("요약 요청 처리 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * Redis 파일 파싱해서 S3 에 TXT 파일 업로드(관리자 및 상담사용 다운용 파일)
     */
    private String formatSummaryForText(SummaryRequest request) {
        String userName = userInfoService.getUserNameById(request.getUserId());
        String counselorName = userInfoService.getCounselorNameById(request.getCounselorId());

        StringBuilder sb = new StringBuilder();
        sb.append("채팅 내역:\n\n");

        int index = 1;
        for (Map<String, String> msg : request.getMessages()) {
            String role = msg.get("role").equals("ROLE_USER") ? userName : counselorName;
            sb.append(String.format("[%s] %s\n", role, msg.get("content")));
        }

        return sb.toString();
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