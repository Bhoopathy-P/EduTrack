package com.edutrack.repository;

import com.edutrack.entity.DiscussionPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {
    List<DiscussionPost> findByCourseId(Long courseId);
    List<DiscussionPost> findByCourseIdOrderByCreatedAtAsc(Long courseId);
}
