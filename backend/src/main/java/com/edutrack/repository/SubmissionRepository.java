package com.edutrack.repository;

import com.edutrack.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByAssignmentId(Long assignmentId);
    Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
    List<Submission> findByAssignmentIdIn(List<Long> assignmentIds);
}
