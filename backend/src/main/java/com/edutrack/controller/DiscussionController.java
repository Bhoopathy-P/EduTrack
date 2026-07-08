package com.edutrack.controller;

import com.edutrack.dto.DiscussionPostDto;
import com.edutrack.security.UserDetailsImpl;
import com.edutrack.service.DiscussionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    @Autowired
    private DiscussionService discussionService;

    @GetMapping
    public ResponseEntity<List<DiscussionPostDto>> getPosts(@RequestParam Long courseId) {
        return ResponseEntity.ok(discussionService.getPostsByCourseId(courseId));
    }

    @PostMapping
    public ResponseEntity<DiscussionPostDto> createPost(
            @RequestBody DiscussionPostDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return new ResponseEntity<>(discussionService.createPost(dto, userDetails.getId(), userDetails.getName()), HttpStatus.CREATED);
    }
}
