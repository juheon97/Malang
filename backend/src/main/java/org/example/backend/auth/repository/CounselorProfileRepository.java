package org.example.backend.auth.repository;

import org.example.backend.auth.model.CounselorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CounselorProfileRepository extends JpaRepository<CounselorProfile, String> {
    Optional<CounselorProfile> findByUserId(Long userId);
}