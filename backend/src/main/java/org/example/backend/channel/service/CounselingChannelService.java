package org.example.backend.channel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.event.CounselorProfileUpdatedEvent;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.CounselorProfile;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorProfileRepository;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.example.backend.channel.dto.request.CounselingChannelCreateRequest;
import org.example.backend.channel.dto.request.CounselingRequestDto;
import org.example.backend.channel.dto.response.CounselingChannelResponse;
import org.example.backend.channel.dto.response.CounselorDetailResponse;
import org.example.backend.channel.dto.response.CounselorListResponse;
import org.example.backend.channel.dto.response.CounselorReviewResponse;
import org.example.backend.channel.model.Channel;
import org.example.backend.channel.model.ChannelType;
import org.example.backend.channel.model.CounselingReview;
import org.example.backend.channel.repository.ChannelRepository;
import org.example.backend.channel.repository.CounselingReviewRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CounselingChannelService {

    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;
    private final CounselorProfileRepository counselorProfileRepository;
    private final CounselingReviewRepository counselingReviewRepository;

    /**
     * 상담사 프로필 업데이트 이벤트 리스너
     * 상담사 프로필이 업데이트되면 해당 상담사의 캐시된 정보를 제거합니다.
     *
     * @param event 상담사 프로필 업데이트 이벤트
     */
    @EventListener
    @CacheEvict(value = {"counselors", "counselorList"}, allEntries = true)
    public void handleCounselorProfileUpdated(CounselorProfileUpdatedEvent event) {
        log.info("상담사 프로필 업데이트 이벤트 수신: userId={}, counselorId={}",
                event.getUserId(), event.getCounselorId());

        try {
            // 프로필 변경 시 필요한 추가 작업이 있다면 여기에 구현
            log.info("상담사 프로필 업데이트로 인해 캐시 제거 완료: counselorId={}", event.getCounselorId());
        } catch (Exception e) {
            log.error("상담사 프로필 업데이트 이벤트 처리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 상담 채널 ID 생성 - Long 타입으로 변경
     * @return 생성된 채널 ID
     */
    private Long generateCounselingChannelId() {
        // 기존 방식(String)에서 Long으로 변경
        Long maxId = channelRepository.findByCategory(1) // 상담 채널(category=1)
                .stream()
                .map(Channel::getChannelId)
                .max(Long::compareTo)
                .orElse(10000L); // 상담 채널 ID는 10000부터 시작 (음성 채널과 구분)

        return maxId + 1L;
    }

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

        // 새로운 채널 ID 생성
        Long channelId = generateCounselingChannelId();

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

        // 상담사 프로필 상태 업데이트 (1: 상담 중/사용 불가)
        CounselorProfile profile = counselorProfileRepository.findById(counselor.getId())
                .orElseThrow(() -> new IllegalArgumentException("상담사 프로필을 찾을 수 없습니다."));
        profile.updateStatus(1); // 상태를 '상담 중'으로 변경
        counselorProfileRepository.save(profile);

        log.info("상담 채널 생성 완료 및 상담사 상태 업데이트: channelId={}, counselorId={}, status=1",
                channelId, counselor.getId());

        // 응답 DTO 반환
        return CounselingChannelResponse.from(savedChannel, user.getNickname());
    }

    /**
     * 상담 채널 목록 조회
     * userId가 null이면 모든 상담 채널을 조회하고,
     * 그렇지 않으면 특정 상담사의 상담 채널만 조회합니다.
     *
     * @param userId 상담사 사용자 ID (null일 경우 모든 채널 조회)
     * @return 상담 채널 목록
     */
    @Transactional(readOnly = true)
    public List<CounselingChannelResponse> getCounselingChannelList(Long userId) {
        List<Channel> channels;

        if (userId == null) {
            // 모든 상담 채널 조회
            channels = channelRepository.findByCategory(1); // 1 = 상담 채널
        } else {
            // 특정 상담사의 채널만 조회
            // 상담사 여부 확인
            Counselor counselor = counselorRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("상담사 정보를 찾을 수 없습니다."));

            // 상담사가 생성한 모든 상담 채널 조회
            channels = channelRepository.findByCounselorId(counselor.getId());
        }

        // 응답 DTO 변환
        return channels.stream()
                .map(channel -> {
                    // 각 채널의 생성자(상담사) 닉네임 조회
                    String counselorNickname = userRepository.findById(channel.getUserId())
                            .map(User::getNickname)
                            .orElse("알 수 없음");

                    return CounselingChannelResponse.from(channel, counselorNickname);
                })
                .collect(Collectors.toList());
    }

    /**
     * 상담사 목록 조회
     *
     * @param specialty 전문 분야 필터링
     * @param minExperience 최소 경력 필터링
     * @param pageable 페이징 정보
     * @return 상담사 목록
     */
    @Transactional(readOnly = true)
    public Page<CounselorListResponse> getCounselorList(
            String specialty, Integer minExperience, Pageable pageable) {

        // 기본 상담사 목록 조회
        Page<Counselor> counselors = counselorRepository.findAll(pageable);

        // 엔티티를 DTO로 변환
        return counselors.map(counselor -> {
            User user = counselor.getUser();

            // 상담사 프로필 조회 (ID로 조회)
            Optional<CounselorProfile> profileOpt = counselorProfileRepository.findById(counselor.getId());

            // 리뷰 정보 계산
            double satisfactionRate = calculateSatisfactionRate(counselor.getId());
            long reviewCount = counselingReviewRepository.countByCounselorId(counselor.getId());

            // 프로필 정보 추출
            String[] specialties = new String[]{"심리 상담"};
            String[] certifications = new String[]{"심리상담사"};
            String shortIntro = counselor.getName() + " 상담사입니다.";
            int experience = 1;
            Integer status = 0; // 기본 상태: 대기/가능

            // 프로필이 존재하면 정보 사용
            if (profileOpt.isPresent()) {
                CounselorProfile profile = profileOpt.get();

                if (profile.getSpecialty() != null && !profile.getSpecialty().isEmpty()) {
                    specialties = profile.getSpecialty().split(",");
                }

                if (profile.getCertifications() != null && !profile.getCertifications().isEmpty()) {
                    certifications = new String[]{profile.getCertifications()};
                }

                if (profile.getBio() != null && !profile.getBio().isEmpty()) {
                    shortIntro = profile.getBio().length() > 50
                            ? profile.getBio().substring(0, 47) + "..."
                            : profile.getBio();
                }

                if (profile.getYears() != null && !profile.getYears().isEmpty()) {
                    try {
                        // "8년"과 같은 문자열에서 숫자만 추출
                        String yearsStr = profile.getYears().replaceAll("[^0-9]", "");
                        if (!yearsStr.isEmpty()) {
                            experience = Integer.parseInt(yearsStr);
                        }
                    } catch (NumberFormatException e) {
                        log.warn("경력 년수 변환 실패: {}", profile.getYears());
                    }
                }

                // 상담사 상태 정보 사용
                status = profile.getStatus();
            }

            return CounselorListResponse.builder()
                    .id(counselor.getId())
                    .name(user.getNickname() + " 상담사")
                    .profileImage(user.getProfileUrl())
                    .title(specialties != null && specialties.length > 0
                            ? specialties[0] + " 전문가"
                            : "심리 상담 전문가") // 전문 분야를 포함한 타이틀로 수정
                    .specialties(specialties)
                    .experience(experience)
                    .certifications(certifications)
                    .satisfactionRate((int) satisfactionRate)
                    .reviewCount((int) reviewCount)
                    .shortIntro(shortIntro)
                    .status(status) // 상담사 상태 추가
                    .build();
        });
    }

    /**
     * 상담사 상세 정보 조회 (캐싱 적용)
     *
     * @param counselorId 상담사 ID
     * @return 상담사 상세 정보
     */
    @Cacheable(value = "counselors", key = "#counselorId")
    @Transactional(readOnly = true)
    public CounselorDetailResponse getCounselorDetail(Long counselorId) {
        log.info("상담사 상세 정보 조회 요청 (DB에서): counselorId={}", counselorId);

        // 상담사 정보 조회
        Counselor counselor = counselorRepository.findById(counselorId)
                .orElseThrow(() -> new IllegalArgumentException("상담사를 찾을 수 없습니다."));

        // 사용자 정보
        User user = counselor.getUser();

        // 상담사 프로필 조회
        Optional<CounselorProfile> profileOpt = counselorProfileRepository.findById(counselorId);

        // 기본 값 설정
        String[] specialties = new String[]{"심리 상담"};
        String[] certifications = new String[]{"심리상담사"};
        String fullIntro = counselor.getName() + "입니다. 심리 상담을 전문으로 하고 있습니다.";
        int experience = 1;
        String certificationString = "심리상담사";
        Integer status = 0; // 기본 상태: 대기/가능

        // 프로필이 존재하면 정보 사용
        if (profileOpt.isPresent()) {
            CounselorProfile profile = profileOpt.get();

            if (profile.getSpecialty() != null && !profile.getSpecialty().isEmpty()) {
                specialties = profile.getSpecialty().split(",");
            }

            if (profile.getCertifications() != null && !profile.getCertifications().isEmpty()) {
                certifications = new String[]{profile.getCertifications()};
                certificationString = profile.getCertifications();
            }

            if (profile.getBio() != null && !profile.getBio().isEmpty()) {
                fullIntro = profile.getBio();
            }

            if (profile.getYears() != null && !profile.getYears().isEmpty()) {
                try {
                    // "8년"과 같은 문자열에서 숫자만 추출
                    String yearsStr = profile.getYears().replaceAll("[^0-9]", "");
                    if (!yearsStr.isEmpty()) {
                        experience = Integer.parseInt(yearsStr);
                    }
                } catch (NumberFormatException e) {
                    log.warn("경력 년수 변환 실패: {}", profile.getYears());
                }
            }

            // 상담사 상태 정보 사용
            status = profile.getStatus();
        }

        // 리뷰 정보 계산
        double satisfactionRate = calculateSatisfactionRate(counselorId);
        long reviewCount = counselingReviewRepository.countByCounselorId(counselorId);

        return CounselorDetailResponse.builder()
                .id(counselor.getId())
                .name(user.getNickname())
                .gender(counselor.getGender())
                .birthDate(counselor.getBirthdate().toLocalDate())
                .certifications(certificationString)
                .profileImage(user.getProfileUrl())
                .title(getSpecialtyTitle(specialties))
                .specialties(specialties)
                .experience(experience)
                .introduction(fullIntro)
                .availableTimes(new String[]{"평일 오후", "주말 종일"})
                .satisfactionRate((int) satisfactionRate)
                .reviewCount((int) reviewCount)
                .status(status) // 상담사 상태 추가
                .build();
    }

    /**
     * 상담사 리뷰 조회
     *
     * @param counselorId 상담사 ID
     * @param pageable 페이징 정보
     * @return 상담사 리뷰 목록
     */
    @Transactional(readOnly = true)
    public Page<CounselorReviewResponse> getCounselorReviews(Long counselorId, Pageable pageable) {
        // 상담사 존재 확인
        if (!counselorRepository.existsById(counselorId)) {
            throw new IllegalArgumentException("상담사를 찾을 수 없습니다.");
        }

        // 리뷰 조회
        Page<CounselingReview> reviews = counselingReviewRepository.findByCounselorId(counselorId, pageable);

        // 엔티티를 DTO로 변환
        return reviews.map(review -> {
            User user = userRepository.findById(review.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

            return CounselorReviewResponse.builder()
                    .id(review.getCounselingReviewId())
                    .userId(review.getUserId())
                    .userName(user.getNickname())
                    .score(review.getScore())
                    .content(review.getContent())
                    .createdAt(review.getCreatedAt())
                    .build();
        });
    }

    /**
     * 상담 요청 생성
     *
     * @param userId 요청 사용자 ID
     * @param request 상담 요청 정보
     * @return 생성된 상담 요청 정보
     */
    @Transactional
    public Map<String, Object> createCounselingRequest(Long userId, CounselingRequestDto request) {
        // 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 상담사 존재 확인
        Counselor counselor = counselorRepository.findById(request.getCounselorId())
                .orElseThrow(() -> new IllegalArgumentException("상담사를 찾을 수 없습니다."));

        // 상담 타입에 따른 최대 인원 설정
        int maxPlayer = "GROUP".equals(request.getCounselingType()) ? 3 : 1;

        // 새로운 채널 ID 생성
        Long channelId = generateCounselingChannelId();

        // 채널 엔티티 생성
        Channel channel = Channel.builder()
                .channelId(channelId)
                .channelName(request.getCounselingType() + " 상담: " + user.getNickname())
                .maxPlayer(maxPlayer)
                .userId(userId)
                .counselorId(counselor.getId())
                .channelType(ChannelType.COUNSELING)
                .description(request.getMessage())
                .build();

        // 예약 정보는 별도로 처리
        // 상태 업데이트도 별도로 처리
        Channel savedChannel = channelRepository.save(channel);

        // 별도 상담 요청 테이블이 있다면 여기서 추가 저장 처리

        // 응답 데이터 생성
        Map<String, Object> response = new HashMap<>();
        response.put("requestId", savedChannel.getChannelId());
        response.put("status", "pending");
        response.put("message", "상담 요청이 성공적으로 전송되었습니다.");
        response.put("scheduledTime", request.getDesiredDateTime());

        return response;
    }

    /**
     * 상담사 만족도 계산
     *
     * @param counselorId 상담사 ID
     * @return 만족도 비율 (0-100)
     */
    private double calculateSatisfactionRate(Long counselorId) {
        // 리뷰 평균 점수 계산 (5점 만점)
        Double avgScore = counselingReviewRepository.findAverageScoreByCounselorId(counselorId);

        // 리뷰가 없으면 기본값 반환
        if (avgScore == null) {
            return 90.0; // 기본값으로 90% 설정
        }

        // 5점 만점을 백분율로 변환 (5점 = 100%)
        return Math.min(avgScore * 20, 100.0);
    }

    /**
     * 상담사 전문 분야 타이틀 생성
     *
     * @param specialties 전문 분야 배열
     * @return 전문 분야 타이틀
     */
    private String getSpecialtyTitle(String[] specialties) {
        if (specialties != null && specialties.length > 0) {
            return specialties[0] + " 전문";
        }
        return "심리 상담 분야";
    }
}