package com.edutrack.service;

import com.edutrack.dto.AuthRequestDto;
import com.edutrack.dto.AuthResponseDto;
import com.edutrack.dto.UserDto;
import com.edutrack.entity.User;
import com.edutrack.exception.ResourceNotFoundException;
import com.edutrack.repository.UserRepository;
import com.edutrack.config.JwtTokenUtil;
import com.edutrack.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponseDto register(AuthRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User.Role role = User.Role.STUDENT;
        if (dto.getRole() != null) {
            try {
                role = User.Role.valueOf(dto.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role provided. Choose STUDENT, INSTRUCTOR, or ADMIN.");
            }
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String token = jwtTokenUtil.generateToken(userDetails);

        return new AuthResponseDto(token, convertToDto(user));
    }

    public AuthResponseDto login(AuthRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        if (!userDetails.isActive()) {
            throw new IllegalStateException("Your account has been deactivated by the Administrator.");
        }

        String token = jwtTokenUtil.generateToken(userDetails);

        return AuthResponseDto.builder()
                .token(token)
                .user(UserDto.builder()
                        .id(userDetails.getId())
                        .name(userDetails.getName())
                        .email(userDetails.getEmail())
                        .role(userDetails.getRole())
                        .active(userDetails.isActive())
                        .build())
                .build();
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void toggleUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setActive(active);
        userRepository.save(user);
    }

    public UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .active(user.isActive())
                .build();
    }
}
