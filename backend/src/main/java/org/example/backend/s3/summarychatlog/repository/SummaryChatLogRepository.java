package org.example.backend.s3.summarychatlog.repository;

import org.example.backend.localllm.model.Summary;
import org.example.backend.s3.summarychatlog.model.SummaryChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SummaryChatLogRepository extends JpaRepository<SummaryChatLog, Long> {
    List<SummaryChatLog> findByUserId(Long userId);
    List<SummaryChatLog> findByCounselorId(Long counselorId);

}

