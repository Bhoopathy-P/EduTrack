package com.edutrack.controller;

import com.edutrack.dto.CourseDto;
import com.edutrack.dto.UserDto;
import com.edutrack.entity.Course;
import com.edutrack.entity.User;
import com.edutrack.repository.CourseRepository;
import com.edutrack.repository.EnrollmentRepository;
import com.edutrack.repository.UserRepository;
import com.edutrack.service.CourseService;
import com.edutrack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    // 1. User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        if (active == null) {
            throw new IllegalArgumentException("Active boolean status is required");
        }
        userService.toggleUserStatus(id, active);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User status updated successfully");
        return ResponseEntity.ok(response);
    }

    // 2. Course Approvals
    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll().stream()
                .map(courseService::convertToDto)
                .collect(Collectors.toList()));
    }

    @PutMapping("/courses/{id}/status")
    public ResponseEntity<CourseDto> updateCourseStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || (!"APPROVED".equalsIgnoreCase(status) && !"REJECTED".equalsIgnoreCase(status) && !"PENDING".equalsIgnoreCase(status))) {
            throw new IllegalArgumentException("Invalid status provided");
        }
        courseService.updateCourseStatus(id, status.toUpperCase());
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // 3. Platform Statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        List<User> allUsers = userRepository.findAll();
        List<Course> allCourses = courseRepository.findAll();

        long totalStudents = allUsers.stream().filter(u -> User.Role.STUDENT.equals(u.getRole())).count();
        long totalInstructors = allUsers.stream().filter(u -> User.Role.INSTRUCTOR.equals(u.getRole())).count();
        long pendingCourses = allCourses.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
        long totalEnrollments = enrollmentRepository.count();

        double avgProgress = enrollmentRepository.findAll().stream()
                .mapToDouble(e -> e.getProgress())
                .average()
                .orElse(0.0);

        stats.put("totalStudents", totalStudents);
        stats.put("totalInstructors", totalInstructors);
        stats.put("totalCourses", allCourses.size());
        stats.put("pendingCourses", pendingCourses);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("averageProgress", Math.round(avgProgress));

        return ResponseEntity.ok(stats);
    }
}
