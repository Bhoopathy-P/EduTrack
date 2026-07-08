package com.edutrack.controller;

import com.edutrack.dto.EnrollmentDto;
import com.edutrack.security.UserDetailsImpl;
import com.edutrack.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<EnrollmentDto>> getEnrollments(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(enrollmentService.getEnrollments(userDetails.getId(), userDetails.getRole()));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDto> enroll(
            @RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long courseId = payload.get("courseId");
        if (courseId == null) {
            throw new IllegalArgumentException("CourseId is required");
        }
        return new ResponseEntity<>(enrollmentService.enroll(userDetails.getId(), courseId), HttpStatus.CREATED);
    }

    @PostMapping("/complete-lecture")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDto> completeLecture(
            @RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long courseId = payload.get("courseId");
        Long lectureId = payload.get("lectureId");
        if (courseId == null || lectureId == null) {
            throw new IllegalArgumentException("CourseId and LectureId are required");
        }
        return ResponseEntity.ok(enrollmentService.completeLecture(userDetails.getId(), courseId, lectureId));
    }
}
