package com.edutrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Integer progress = 0; // % completed

    @Column(name = "enrolled_date")
    private LocalDate enrolledDate;

    @ElementCollection
    @CollectionTable(name = "completed_lectures", joinColumns = @JoinColumn(name = "enrollment_id"))
    @Column(name = "lecture_id")
    @Builder.Default
    private List<Long> completedLectures = new ArrayList<>();
}
