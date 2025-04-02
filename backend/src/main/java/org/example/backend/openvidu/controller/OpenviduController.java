package org.example.backend.openvidu.controller;


import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/openvidu")
@RequiredArgsConstructor
public class OpenviduController {

//    @Value("${openvidu.url}")
//    private String OPENVIDU_URL;
//
//    @Value("${openvidu.secret}")
//    private String OPENVIDU_SECRET;

    private final OpenVidu openvidu;

//    public OpenviduController(@Value("${openvidu.url}") String openviduUrl,
//                              @Value("${openvidu.secret}") String openviduSecret) {
//        initializeOpenVidu(openviduUrl, openviduSecret);
//    }
//
//    // OpenVidu 초기화 메서드
//    private void initializeOpenVidu(String url, String secret) {
//        this.openvidu = new OpenVidu(url, secret);
//    }

    @PostMapping("/session/{session_id}")
    public ResponseEntity<String> createSession(@PathVariable("session_id") String sessionId) {
        try {
            // OpenVidu 객체 업데이트 (서버가 재시작되었을 수 있음)
            this.openvidu.fetch();

            // 세션 속성 설정 (필요한 경우)
            SessionProperties properties = new SessionProperties.Builder()
                    .customSessionId(sessionId)
                    .build();

            // 세션 얻기 (존재하지 않으면 생성)
            Session session = this.openvidu.createSession(properties);

            // 성공 응답 반환
            return ResponseEntity.ok("{\"sessionId\": \"" + session.getSessionId() + "\"}");

        } catch (OpenViduJavaClientException e) {
            // OpenVidu 클라이언트 예외 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"OpenVidu Java Client error: " + e.getMessage() + "\"}");
        } catch (OpenViduHttpException e) {
            // OpenVidu HTTP 예외 처리
            return ResponseEntity.status(e.getStatus())
                    .body("{\"error\": \"OpenVidu HTTP error: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/session/token")
    public ResponseEntity<String> generateToken(@RequestBody Map<String, Object> params) {
        String sessionId;
        try {
            // 요청 본문에서 세션 ID 가져오기
            if (params.get("sessionId") == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Session ID is required\"}");
            }
            sessionId = String.valueOf(params.get("sessionId"));

            // OpenVidu 객체 업데이트
            this.openvidu.fetch();

            // 해당 세션 ID로 세션 가져오기
            Session session = this.openvidu.getActiveSession(sessionId);
            if (session == null) {
                return ResponseEntity.notFound().build();
            }

            // 토큰 생성을 위한 연결 속성 설정
            ConnectionProperties connectionProperties = new ConnectionProperties.Builder()
                    .type(ConnectionType.WEBRTC) // WebRTC 연결 타입 설정
                    .role(OpenViduRole.PUBLISHER) // 사용자 역할 설정 (PUBLISHER, SUBSCRIBER, MODERATOR)
                    .build();

            // 토큰 생성
            String token = session.createConnection(connectionProperties).getToken();

            // 토큰 반환
            return ResponseEntity.ok("{\"token\": \"" + token + "\"}");

        } catch (OpenViduJavaClientException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"OpenVidu Java Client error: " + e.getMessage() + "\"}");
        } catch (OpenViduHttpException e) {
            if (e.getStatus() == 404) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(e.getStatus())
                    .body("{\"error\": \"OpenVidu HTTP error: " + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/session/{session_id}")
    public ResponseEntity<String> deleteSession(@PathVariable("session_id") String sessionId) {
        try {
            // OpenVidu 객체 업데이트
            this.openvidu.fetch();

            // 세션 가져오기
            Session session = this.openvidu.getActiveSession(sessionId);
            if (session == null) {
                return ResponseEntity.notFound().build();
            }

            // 세션 닫기 (삭제)
            session.close();

            return ResponseEntity.ok("{\"status\": \"Session closed successfully\"}");

        } catch (OpenViduJavaClientException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"OpenVidu Java Client error: " + e.getMessage() + "\"}");
        } catch (OpenViduHttpException e) {
            return ResponseEntity.status(e.getStatus())
                    .body("{\"error\": \"OpenVidu HTTP error: " + e.getMessage() + "\"}");
        }
    }

}
