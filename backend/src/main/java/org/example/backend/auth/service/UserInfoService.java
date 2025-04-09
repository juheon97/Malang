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
        return userRepository.findById(userId)
                .map(User::getProfileUrl) // ← 여기서 profile_url 컬럼 (S3 Key)을 가져옴
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }


}
