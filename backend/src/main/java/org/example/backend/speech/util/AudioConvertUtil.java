package org.example.backend.speech.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.*;

@Slf4j
@Component
public class AudioConvertUtil {

    @Value("${ffmpeg.location}")
    private String ffmpegPath;

    public void convertWavToPcmWithFfmpeg(File wavFile, File pcmFile) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath, "-y",
                "-i", wavFile.getAbsolutePath(),
                "-f", "s16le",
                "-acodec", "pcm_s16le",
                "-ar", "16000",
                "-ac", "1",
                "-" // stdout으로 출력
        );

        pb.redirectErrorStream(true);
        Process process = pb.start();

        try (BufferedInputStream ffmpegOut = new BufferedInputStream(process.getInputStream());
             FileOutputStream fos = new FileOutputStream(pcmFile)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = ffmpegOut.read(buffer)) != -1) {
                fos.write(buffer, 0, bytesRead);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("ffmpeg 변환 실패: exit code = " + exitCode);
        }

        if (!pcmFile.exists() || pcmFile.length() == 0) {
            throw new RuntimeException("PCM 파일이 생성되지 않았거나 크기가 0입니다");
        }
    }
}