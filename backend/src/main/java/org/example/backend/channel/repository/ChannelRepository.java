package org.example.backend.channel.repository;

import org.example.backend.channel.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, String> {

    // 특정 카테고리(채널 타입)의 모든 채널 조회
    List<Channel> findByCategory(int category);

    // 특정 사용자가 생성한 모든 채널 조회
    List<Channel> findByUserId(Long userId);

    // 특정 카테고리 내에서 이름으로 채널 검색
    List<Channel> findByCategoryAndChannelNameContaining(int category, String channelName);

    // 채널 이름과 생성자로 채널 검색 (중복 체크용)
    Optional<Channel> findByChannelNameAndUserId(String channelName, Long userId);

    // 특정 상담사의 채널 조회 (상담 채널용)
    List<Channel> findByCounselorId(String counselorId);

    // 특정 상담사의 특정 상태 채널 조회 (상담 요청 목록용)
    List<Channel> findByCounselorIdAndStatus(String counselorId, Integer status);

    // 특정 사용자의 특정 상태 채널 조회
    List<Channel> findByUserIdAndStatus(Long userId, Integer status);

    // 상태별 모든 채널 조회
    List<Channel> findByStatus(Integer status);
}