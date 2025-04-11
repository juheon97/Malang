package org.example.backend.localllm.repository;

import org.example.backend.localllm.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SummaryRepository extends JpaRepository<Summary, Long> {
//    List<Summary> findAllByCounselor_Id(Long counselorId);
    List<Summary> findAllByCounselorId(Long counselorId);
}
