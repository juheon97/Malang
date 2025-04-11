package org.example.backend.auth.repository;

import org.example.backend.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> { // User 는 다룰 엔티티 타입이고 Long 은 해당 엔티티의 ID 타입.

    // 이메일로 사용자 찾기, 현재 이 기능은 API 명세서에 없음.
    Optional<User> findByEmail(String email);

    // 이메일 존재 여부 확인, 현재 이 기능은 API 명세서에 없음.
    boolean existsByEmail(String email);

    // 닉네임 존재 여부 확인, 현재 이 기능은 API 명세서에 없음.
    boolean existsByNickname(String nickname);
}