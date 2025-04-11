package org.example.backend.community.repository;

import org.example.backend.community.model.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Integer> {

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

    // 수정용
    @Transactional
    @Modifying
    @Query("UPDATE Community c SET c.communityCategory = :category, c.title = :title, c.content = :content WHERE c.articleId = :articleId AND c.userId = :userId")
    int updateByArticleIdAndUserId(
            @Param("articleId") Integer articleId,
            @Param("category") String category,
            @Param("title") String title,
            @Param("content") String content,
            @Param("userId") Long userId
    );


}
