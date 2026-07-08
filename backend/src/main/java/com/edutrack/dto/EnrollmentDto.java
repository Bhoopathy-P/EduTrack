package com.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDto {
    private Long id;
    private Long studentId;
    private Long courseId;
    private Integer progress;
    private LocalDate enrolledDate;
    private List<Long> completedLectures;
    private CourseDto course; // Enriched course details if needed
    private String studentName;
    private String studentEmail;
}
