package org.example.backend.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.nio.file.Files;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Uploader {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String uploadFile(File file, String key) {
        String contentType = guessContentType(file);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        s3Client.putObject(request, RequestBody.fromFile(file));

        return getFileUrl(key);
    }

    public String getFileUrl(String key) {
        return s3Client.utilities()
                .getUrl(builder -> builder.bucket(bucket).key(key))
                .toExternalForm();
    }

    private String guessContentType(File file) {
        try {
            return Files.probeContentType(file.toPath());
        } catch (Exception e) {
            return "application/octet-stream";
        }
    }
}
