package com.example.mecha.auth.dto;

import com.example.mecha.user.AuthProvider;
import com.example.mecha.user.UserRole;
import com.example.mecha.user.AccountStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private AuthProvider provider;
    private AccountStatus status;
    private Instant createdAt;
}
