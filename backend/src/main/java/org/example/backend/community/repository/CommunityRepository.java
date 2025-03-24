package org.example.backend.community.repository;

import org.example.backend.community.model.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {

    // 카테고리별 조회
    @Query("SELECT c FROM Community c WHERE c.communityCategory = :category")
    Page<Community> findByCategory(@Param("category") String category, Pageable pageable);

    // 최신순 정렬
    @Query("SELECT c FROM Community c ORDER BY c.createdAt DESC")
    Page<Community> findAllOrderByCreatedAtDesc(Pageable pageable);

    // 오래된순 정렬
    @Query("SELECT c FROM Community c ORDER BY c.createdAt")
    Page<Community> findAllOrderByCreatedAtAsc(Pageable pageable);

    @Query("SELECT c FROM Community c WHERE c.articleId = :articleId")
    Optional<Community> findByArticleId(@Param("articleId") Integer articleId);
}
