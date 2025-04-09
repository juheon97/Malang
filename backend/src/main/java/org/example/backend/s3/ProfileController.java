package org.example.backend.s3;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
@Tag(name = "S3 프로필 업로드")
public class ProfileController {

    private final S3Uploader s3Uploader;

    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadProfileImage(@RequestPart("image") MultipartFile file,
                                                     @RequestParam("userId") Long userId) {
        try {
            String fileName = "profile-images/user_" + userId + "_" + UUID.randomUUID() + ".jpg";
            File tempFile = File.createTempFile("profile_", ".jpg");
            file.transferTo(tempFile);

            String s3Url = s3Uploader.uploadFile(tempFile, fileName);

            return ResponseEntity.ok(s3Url);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
        }
    }
}