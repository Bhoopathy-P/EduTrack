package com.edutrack.service;

import com.edutrack.dto.DiscussionPostDto;
import com.edutrack.entity.DiscussionPost;
import com.edutrack.repository.DiscussionPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    @Autowired
    private DiscussionPostRepository repository;

    @Transactional(readOnly = true)
    public List<DiscussionPostDto> getPostsByCourseId(Long courseId) {
        return repository.findByCourseIdOrderByCreatedAtAsc(courseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DiscussionPostDto createPost(DiscussionPostDto dto, Long userId, String userName) {
        DiscussionPost post = DiscussionPost.builder()
                .courseId(dto.getCourseId())
                .userId(userId)
                .userName(userName)
                .message(dto.getMessage())
                .parentId(dto.getParentId())
                .createdAt(LocalDateTime.now())
                .build();

        post = repository.save(post);
        return convertToDto(post);
    }

    private DiscussionPostDto convertToDto(DiscussionPost p) {
        return DiscussionPostDto.builder()
                .id(p.getId())
                .courseId(p.getCourseId())
                .userId(p.getUserId())
                .userName(p.getUserName())
                .message(p.getMessage())
                .parentId(p.getParentId())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
