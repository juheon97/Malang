package org.example.backend.localllm.repository;

import org.example.backend.localllm.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SummaryRepository extends JpaRepository<Summary, Long> {
    List<Summary> findByUser_Id(Long userId);
}
