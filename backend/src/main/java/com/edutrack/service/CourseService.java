package com.edutrack.service;

import com.edutrack.dto.CourseDto;
import com.edutrack.dto.ModuleDto;
import com.edutrack.dto.LectureDto;
import com.edutrack.entity.Course;
import com.edutrack.entity.Module;
import com.edutrack.entity.Lecture;
import com.edutrack.exception.ResourceNotFoundException;
import com.edutrack.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<CourseDto> getCourses(Long instructorId, String role) {
        List<Course> courses;
        if ("ADMIN".equalsIgnoreCase(role)) {
            courses = courseRepository.findAll();
        } else if ("INSTRUCTOR".equalsIgnoreCase(role)) {
            // Instructor sees all approved courses plus their own
            courses = courseRepository.findByInstructorIdOrStatus(instructorId, "APPROVED");
        } else {
            // Students/Guests see APPROVED only
            courses = courseRepository.findByStatus("APPROVED");
        }
        return courses.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return convertToDto(course);
    }

    @Transactional
    public CourseDto createCourse(CourseDto dto, Long instructorId, String instructorName) {
        Course course = Course.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .instructorId(instructorId)
                .instructorName(instructorName)
                .category(dto.getCategory())
                .price(dto.getPrice())
                .thumbnail(dto.getThumbnail())
                .status("PENDING")
                .build();

        if (dto.getModules() != null) {
            List<Module> modules = new ArrayList<>();
            for (ModuleDto mDto : dto.getModules()) {
                Module module = Module.builder()
                        .title(mDto.getTitle())
                        .orderIndex(mDto.getOrder())
                        .course(course)
                        .build();

                if (mDto.getLectures() != null) {
                    List<Lecture> lectures = new ArrayList<>();
                    for (LectureDto lDto : mDto.getLectures()) {
                        lectures.add(Lecture.builder()
                                .title(lDto.getTitle())
                                .contentUrl(lDto.getContentUrl())
                                .type(lDto.getType())
                                .module(module)
                                .build());
                    }
                    module.setLectures(lectures);
                }
                modules.add(module);
            }
            course.setModules(modules);
        }

        course = courseRepository.save(course);
        return convertToDto(course);
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseDto dto, Long instructorId, String role) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (!"ADMIN".equalsIgnoreCase(role) && !course.getInstructorId().equals(instructorId)) {
            throw new IllegalArgumentException("You are not authorized to update this course.");
        }

        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setCategory(dto.getCategory());
        course.setPrice(dto.getPrice());
        course.setThumbnail(dto.getThumbnail());

        // Reset status for re-approval if instructor edits
        if (!"ADMIN".equalsIgnoreCase(role)) {
            course.setStatus("PENDING");
        }

        // Re-align modules list
        course.getModules().clear();
        if (dto.getModules() != null) {
            for (ModuleDto mDto : dto.getModules()) {
                Module module = Module.builder()
                        .title(mDto.getTitle())
                        .orderIndex(mDto.getOrder())
                        .course(course)
                        .build();

                if (mDto.getLectures() != null) {
                    List<Lecture> lectures = new ArrayList<>();
                    for (LectureDto lDto : mDto.getLectures()) {
                        lectures.add(Lecture.builder()
                                .title(lDto.getTitle())
                                .contentUrl(lDto.getContentUrl())
                                .type(lDto.getType())
                                .module(module)
                                .build());
                    }
                    module.setLectures(lectures);
                }
                course.getModules().add(module);
            }
        }

        course = courseRepository.save(course);
        return convertToDto(course);
    }

    @Transactional
    public void deleteCourse(Long id, Long instructorId, String role) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (!"ADMIN".equalsIgnoreCase(role) && !course.getInstructorId().equals(instructorId)) {
            throw new IllegalArgumentException("You are not authorized to delete this course.");
        }

        courseRepository.delete(course);
    }

    @Transactional
    public void updateCourseStatus(Long id, String status) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        course.setStatus(status);
        courseRepository.save(course);
    }

    public CourseDto convertToDto(Course course) {
        List<ModuleDto> modules = course.getModules().stream().map(m -> {
            List<LectureDto> lectures = m.getLectures().stream().map(l ->
                LectureDto.builder()
                        .id(l.getId())
                        .title(l.getTitle())
                        .contentUrl(l.getContentUrl())
                        .type(l.getType())
                        .build()
            ).collect(Collectors.toList());

            return ModuleDto.builder()
                    .id(m.getId())
                    .title(m.getTitle())
                    .order(m.getOrderIndex())
                    .lectures(lectures)
                    .build();
        }).collect(Collectors.toList());

        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorId(course.getInstructorId())
                .instructorName(course.getInstructorName())
                .category(course.getCategory())
                .price(course.getPrice())
                .thumbnail(course.getThumbnail())
                .status(course.getStatus())
                .modules(modules)
                .build();
    }
}
