package com.edutrack.service;

import com.edutrack.dto.EnrollmentDto;
import com.edutrack.dto.CourseDto;
import com.edutrack.entity.Course;
import com.edutrack.entity.Enrollment;
import com.edutrack.entity.User;
import com.edutrack.exception.ResourceNotFoundException;
import com.edutrack.repository.CourseRepository;
import com.edutrack.repository.EnrollmentRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseService courseService;

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getEnrollments(Long userId, String role) {
        List<Enrollment> enrollments;
        if ("STUDENT".equalsIgnoreCase(role)) {
            enrollments = enrollmentRepository.findByStudentId(userId);
            return enrollments.stream().map(en -> {
                EnrollmentDto dto = convertToDto(en);
                Optional<Course> courseOpt = courseRepository.findById(en.getCourseId());
                courseOpt.ifPresent(course -> dto.setCourse(courseService.convertToDto(course)));
                return dto;
            }).collect(Collectors.toList());
        } else {
            // Instructor sees enrollments for their own courses
            List<Long> instructorCourseIds = courseRepository.findByInstructorId(userId).stream()
                    .map(Course::getId)
                    .collect(Collectors.toList());

            List<EnrollmentDto> results = new ArrayList<>();
            for (Long courseId : instructorCourseIds) {
                List<Enrollment> courseEnrollments = enrollmentRepository.findByCourseId(courseId);
                for (Enrollment en : courseEnrollments) {
                    EnrollmentDto dto = convertToDto(en);
                    Optional<User> studentOpt = userRepository.findById(en.getStudentId());
                    studentOpt.ifPresent(student -> {
                        dto.setStudentName(student.getName());
                        dto.setStudentEmail(student.getEmail());
                    });
                    Optional<Course> courseOpt = courseRepository.findById(en.getCourseId());
                    courseOpt.ifPresent(course -> dto.setCourse(courseService.convertToDto(course)));
                    results.add(dto);
                }
            }
            return results;
        }
    }

    @Transactional
    public EnrollmentDto enroll(Long studentId, Long courseId) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new IllegalArgumentException("You are already enrolled in this course");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (!"APPROVED".equalsIgnoreCase(course.getStatus())) {
            throw new IllegalArgumentException("Course is not approved and cannot receive enrollments.");
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .progress(0)
                .enrolledDate(LocalDate.now())
                .completedLectures(new ArrayList<>())
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return convertToDto(enrollment);
    }

    @Transactional
    public EnrollmentDto completeLecture(Long studentId, Long courseId, Long lectureId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found for student " + studentId + " in course " + courseId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (!enrollment.getCompletedLectures().contains(lectureId)) {
            enrollment.getCompletedLectures().add(lectureId);
        }

        // Calculate progress percentage
        int totalLectures = course.getModules().stream()
                .mapToInt(m -> m.getLectures().size())
                .sum();

        if (totalLectures > 0) {
            int completedCount = enrollment.getCompletedLectures().size();
            int progressPercent = (int) Math.round(((double) completedCount / totalLectures) * 100);
            enrollment.setProgress(Math.min(progressPercent, 100));
        } else {
            enrollment.setProgress(100);
        }

        enrollment = enrollmentRepository.save(enrollment);
        return convertToDto(enrollment);
    }

    private EnrollmentDto convertToDto(Enrollment enrollment) {
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudentId())
                .courseId(enrollment.getCourseId())
                .progress(enrollment.getProgress())
                .enrolledDate(enrollment.getEnrolledDate())
                .completedLectures(enrollment.getCompletedLectures())
                .build();
    }
}
