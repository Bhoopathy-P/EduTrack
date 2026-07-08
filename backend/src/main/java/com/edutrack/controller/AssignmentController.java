package com.edutrack.controller;

import com.edutrack.dto.AssignmentDto;
import com.edutrack.dto.SubmissionDto;
import com.edutrack.security.UserDetailsImpl;
import com.edutrack.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    // 1. Assignments
    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentDto>> getAssignments(@RequestParam Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourseId(courseId));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody AssignmentDto dto) {
        return new ResponseEntity<>(assignmentService.createAssignment(dto), HttpStatus.CREATED);
    }

    // 2. Submissions
    @GetMapping("/submissions")
    public ResponseEntity<List<SubmissionDto>> getSubmissions(
            @RequestParam(required = false) Long assignmentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(assignmentService.getSubmissions(userDetails.getId(), userDetails.getRole(), assignmentId));
    }

    @PostMapping("/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionDto> submitAssignment(
            @RequestBody SubmissionDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return new ResponseEntity<>(assignmentService.submitAssignment(dto, userDetails.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/submissions/{id}/grade")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<SubmissionDto> gradeSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String grade = payload.get("grade");
        if (grade == null) {
            throw new IllegalArgumentException("Grade value is required");
        }
        return ResponseEntity.ok(assignmentService.gradeSubmission(id, grade));
    }
}
