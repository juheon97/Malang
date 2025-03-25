package org.example.backend.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter // Lombok 의 Getter 어노테이션 : 모든 필드에 대한 getter 메소드를 자동 생성
@MappedSuperclass // MapperSuperclass 어노테이션 : 테이블과 직접 매핑되지 않지만, 이 클래스를 상속받는 JPA 엔티티 클래스들에게 매핑 정보를 제공. 즉, 이 클래스의 필드들이 자식 엔티티 클래스의 테이블 칼럼으로 매핑.
@EntityListeners(AuditingEntityListener.class) // 엔티티의 특정 이벤트가 발생할 때 호출할 리스너를 지정. 자동으로 날짜와 시간 값을 설정해주는 리스너
public abstract class BaseTimeEntity {

    @CreatedDate // 엔티티가 처음 저장될 때 현재 시간을 자동으로 이 필드에 설정.
    @Column(name = "created_at", updatable = false) // 이 필드가 DB 테이블의 컬럼과 매핑됨을 나타냄. false 는 업데이트 될 때 변경되지 않도록 함.
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;
}
