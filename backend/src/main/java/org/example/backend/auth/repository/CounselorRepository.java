package org.example.backend.auth.repository;

import org.example.backend.auth.model.Counselor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CounselorRepository extends JpaRepository<Counselor, String> {
    Optional<Counselor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}