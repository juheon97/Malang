package org.example.backend.speech.service;

import org.springframework.web.multipart.MultipartFile;

public interface SpeechService {
    String processFile(MultipartFile file);
}
