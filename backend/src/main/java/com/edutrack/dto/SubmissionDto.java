package com.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDto {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String fileUrl;
    private String grade;
    private String status;
    private LocalDateTime submissionDate;
    private String studentName;
    private String studentEmail;
    private String assignmentTitle;
}
