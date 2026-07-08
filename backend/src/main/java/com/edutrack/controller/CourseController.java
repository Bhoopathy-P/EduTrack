package com.edutrack.controller;

import com.edutrack.dto.CourseDto;
import com.edutrack.security.UserDetailsImpl;
import com.edutrack.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDto>> getCourses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        String role = userDetails != null ? userDetails.getRole() : "GUEST";
        return ResponseEntity.ok(courseService.getCourses(userId, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDto> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseDto> createCourse(
            @RequestBody CourseDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return new ResponseEntity<>(courseService.createCourse(dto, userDetails.getId(), userDetails.getName()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseDto> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(courseService.updateCourse(id, dto, userDetails.getId(), userDetails.getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        courseService.deleteCourse(id, userDetails.getId(), userDetails.getRole());
        return ResponseEntity.noContent().build();
    }
}
