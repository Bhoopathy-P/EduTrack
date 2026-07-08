package com.edutrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "file_url", length = 2048)
    private String fileUrl; // file path, GitHub URL, or quiz answer text

    private String grade;

    @Column(length = 20, nullable = false)
    private String status = "PENDING"; // PENDING, GRADED

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;
}
