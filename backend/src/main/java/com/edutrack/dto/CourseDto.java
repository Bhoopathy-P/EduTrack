package com.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private Long instructorId;
    private String instructorName;
    private String category;
    private Double price;
    private String thumbnail;
    private String status;
    private List<ModuleDto> modules;
}
