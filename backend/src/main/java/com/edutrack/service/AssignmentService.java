package com.edutrack.service;

import com.edutrack.dto.AssignmentDto;
import com.edutrack.dto.SubmissionDto;
import com.edutrack.entity.Assignment;
import com.edutrack.entity.Submission;
import com.edutrack.entity.User;
import com.edutrack.exception.ResourceNotFoundException;
import com.edutrack.repository.AssignmentRepository;
import com.edutrack.repository.CourseRepository;
import com.edutrack.repository.SubmissionRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByCourseId(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDto createAssignment(AssignmentDto dto) {
        Assignment assignment = Assignment.builder()
                .courseId(dto.getCourseId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .type(dto.getType())
                .build();

        assignment = assignmentRepository.save(assignment);
        return convertToDto(assignment);
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissions(Long userId, String role, Long assignmentId) {
        List<Submission> submissions;
        if ("STUDENT".equalsIgnoreCase(role)) {
            submissions = submissionRepository.findByStudentId(userId);
            if (assignmentId != null) {
                submissions = submissions.stream()
                        .filter(s -> s.getAssignmentId().equals(assignmentId))
                        .collect(Collectors.toList());
            }
        } else {
            // Instructor/Admin sees submissions
            if (assignmentId != null) {
                submissions = submissionRepository.findByAssignmentId(assignmentId);
            } else {
                // Return all submissions of courses designed by this instructor
                List<Long> courseIds = courseRepository.findByInstructorId(userId).stream()
                        .map(c -> c.getId())
                        .collect(Collectors.toList());

                List<Long> assignIds = assignmentRepository.findAll().stream()
                        .filter(a -> courseIds.contains(a.getCourseId()))
                        .map(a -> a.getId())
                        .collect(Collectors.toList());

                submissions = submissionRepository.findByAssignmentIdIn(assignIds);
            }
        }

        return submissions.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public SubmissionDto submitAssignment(SubmissionDto dto, Long studentId) {
        Optional<Submission> existing = submissionRepository.findByStudentIdAndAssignmentId(studentId, dto.getAssignmentId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("You have already submitted this assignment");
        }

        Submission submission = Submission.builder()
                .assignmentId(dto.getAssignmentId())
                .studentId(studentId)
                .fileUrl(dto.getFileUrl())
                .status("PENDING")
                .submissionDate(LocalDateTime.now())
                .build();

        submission = submissionRepository.save(submission);
        return convertToDto(submission);
    }

    @Transactional
    public SubmissionDto gradeSubmission(Long submissionId, String grade) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        submission.setGrade(grade);
        submission.setStatus("GRADED");
        submission = submissionRepository.save(submission);
        return convertToDto(submission);
    }

    private AssignmentDto convertToDto(Assignment a) {
        return AssignmentDto.builder()
                .id(a.getId())
                .courseId(a.getCourseId())
                .title(a.getTitle())
                .description(a.getDescription())
                .dueDate(a.getDueDate())
                .type(a.getType())
                .build();
    }

    private SubmissionDto convertToDto(Submission s) {
        SubmissionDto dto = SubmissionDto.builder()
                .id(s.getId())
                .assignmentId(s.getAssignmentId())
                .studentId(s.getStudentId())
                .fileUrl(s.getFileUrl())
                .grade(s.getGrade())
                .status(s.getStatus())
                .submissionDate(s.getSubmissionDate())
                .build();

        // Populate helper attributes
        Optional<User> studentOpt = userRepository.findById(s.getStudentId());
        studentOpt.ifPresent(student -> {
            dto.setStudentName(student.getName());
            dto.setStudentEmail(student.getEmail());
        });

        Optional<Assignment> assignOpt = assignmentRepository.findById(s.getAssignmentId());
        assignOpt.ifPresent(assign -> dto.setAssignmentTitle(assign.getTitle()));

        return dto;
    }
}
