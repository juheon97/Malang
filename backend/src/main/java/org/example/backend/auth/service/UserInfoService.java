package org.example.backend.auth.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.model.Counselor;
import org.example.backend.auth.model.User;
import org.example.backend.auth.repository.CounselorRepository;
import org.example.backend.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserRepository userRepository;
    private final CounselorRepository counselorRepository;

    public String getUserNameById(Long userId) {
        return userRepository.findById(userId).map(User::getNickname).orElse("사용자");
    }

    public String getCounselorNameById(Long counselorId) {
        return counselorRepository.findById(counselorId).map(Counselor::getName).orElse("상담사");
    }

    @Transactional
    public void updateUserProfileImage(Long userId, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.updateProfile(imageUrl, user.getNickname()); // 닉네임 유지
        userRepository.save(user);
    }

    public String getUserProfileKey(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return user.getProfileUrl(); // ← 이건 null일 수도 있음 (정상)
    }


}
