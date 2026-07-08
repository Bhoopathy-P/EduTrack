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
public class DiscussionPostDto {
    private Long id;
    private Long courseId;
    private Long userId;
    private String userName;
    private String message;
    private Long parentId;
    private LocalDateTime createdAt;
}
