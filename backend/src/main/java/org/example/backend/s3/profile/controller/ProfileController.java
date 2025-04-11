package org.example.backend.s3.profile.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.service.UserInfoService;
import org.example.backend.s3.S3Uploader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.io.File;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
@Tag(name = "S3 프로필 이미지")
public class ProfileController {

    private final S3Uploader s3Uploader;
    private final UserInfoService userInfoService;

    @Operation(summary = "pre-signed 이미지 업로드")
    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadProfileImage(@RequestPart("image") MultipartFile file,
                                                     @RequestParam("userId") Long userId) {
        try {

            // 기존 키 조회
            String oldKey = userInfoService.getUserProfileKey(userId);
            if (oldKey != null && !oldKey.isBlank()) {
                s3Uploader.deleteFile(oldKey); // <- 이 메서드 아래에 만들어야 함
            }

            String key = "profile-images/user_" + userId + "_" + UUID.randomUUID() + ".jpg";

            String presignedUrl = s3Uploader.uploadFile(file, key);

            //업로드한 이미지 URL을 DB에 저장
            userInfoService.updateUserProfileImage(userId, key);

            return ResponseEntity.ok(presignedUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
        }
    }

    @Operation(summary = "이미지 불러오는 URL 반환")
    @GetMapping("/image-url")
    public ResponseEntity<String> getProfileImageUrl(@RequestParam Long userId) {
        String key = userInfoService.getUserProfileKey(userId); // 예: profile-images/user_49_xxx.jpg
        String presignedUrl = s3Uploader.generatePresignedUrl(key);
        return ResponseEntity.ok(presignedUrl);
    }

}