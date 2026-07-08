package com.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LectureDto {
    private Long id;
    private String title;
    private String contentUrl;
    private String type; // VIDEO, TEXT
}
