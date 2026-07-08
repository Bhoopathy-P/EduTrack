package com.edutrack.repository;

import com.edutrack.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorId(Long instructorId);
    List<Course> findByStatus(String status);
    List<Course> findByInstructorIdOrStatus(Long instructorId, String status);
}
