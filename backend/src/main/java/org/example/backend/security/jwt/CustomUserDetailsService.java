package org.example.backend.security.jwt;

import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * Spring Security의 UserDetailsService 인터페이스 구현
 * JWT 토큰에서 추출된 사용자 정보를 바탕으로 데이터베이스에서 전체 사용자 정보를 로드
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    /**
     * 생성자를 통한 의존성 주입
     *
     * @param userRepository 사용자 정보 접근 저장소
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 주어진 이메일을 사용하여 사용자 정보를 로드
     * Spring Security에서 인증 시 사용자 정보를 조회하기 위해 호출됨
     *
     * @param email 사용자 이메일 (인증 식별자)
     * @return UserDetails 객체 (Spring Security 인증을 위한 사용자 정보)
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때 발생
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("사용자 이메일로 사용자 정보 로드: {}", email);

        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("사용자를 찾을 수 없음: {}", email);
                    return new UsernameNotFoundException("이메일 " + email + "를 가진 사용자를 찾을 수 없습니다.");
                });

        logger.debug("사용자 정보 로드 성공: {}", email);

        // Spring Security UserDetails 객체 생성
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole())))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false) // 모든 사용자를 활성화 상태로 처리
                .build();
    }
}