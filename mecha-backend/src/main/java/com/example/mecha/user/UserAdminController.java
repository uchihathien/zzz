package com.example.mecha.user;

import com.example.mecha.auth.dto.UserDto;
import com.example.mecha.user.dto.UpdateUserStatusRequest;
import com.example.mecha.user.dto.ResetPasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin Users", description = "Quản lý người dùng (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class UserAdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Danh sách tất cả người dùng")
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestParam(required = false) UserRole role
    ) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }
        
        List<UserDto> dtos = users.stream()
                .map(this::toDto)
                .toList();
        
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật vai trò người dùng")
    public ResponseEntity<UserDto> updateRole(
            @PathVariable Long id,
            @RequestParam UserRole role
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(role);
        userRepository.save(user);
        
        return ResponseEntity.ok(toDto(user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái tài khoản (khóa/mở khóa)")
    public ResponseEntity<UserDto> updateStatus(
            @PathVariable Long id,
            @RequestParam AccountStatus status
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(status);
        userRepository.save(user);
        
        return ResponseEntity.ok(toDto(user));
    }

    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Đặt lại mật khẩu người dùng")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of(
            "message", "Mật khẩu đã được cập nhật thành công",
            "userId", user.getId().toString()
        ));
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
