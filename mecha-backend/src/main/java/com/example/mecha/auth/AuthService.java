package com.example.mecha.auth;

import com.example.mecha.auth.dto.*;
import com.example.mecha.config.JwtService;
import com.example.mecha.user.AuthProvider;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRepository;
import com.example.mecha.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // ============== REGISTER ==============
    public AuthResponse register(RegisterRequest request) {

        var existingOpt = userRepository.findByEmail(request.getEmail());

        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();

            // Case: account tạo bằng GOOGLE, chưa có password -> cho phép đặt password
            if (existing.getProvider() == AuthProvider.GOOGLE && existing.getPassword() == null) {
                existing.setPassword(passwordEncoder.encode(request.getPassword()));
                existing.setFullName(request.getFullName());
                existing.setPhone(request.getPhone());
                existing.setEmailVerified(true);

                userRepository.save(existing);
                return buildAuthResponse(existing);
            }

            // Các trường hợp còn lại -> email đã dùng
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,                // 409
                    "Email đã được sử dụng, vui lòng đăng nhập hoặc dùng Google đăng nhập."
            );
        }

        // Chưa có user -> tạo mới LOCAL
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .provider(AuthProvider.LOCAL)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ============== LOGIN ==============
    public AuthResponse login(LoginRequest request) {
        var authToken = new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
        );

        try {
            authenticationManager.authenticate(authToken);
        } catch ( AuthenticationException ex) {
            // Sai email hoặc mật khẩu
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,            // 401
                    "Email hoặc mật khẩu không đúng"
            );
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User không tồn tại"
                ));

        return buildAuthResponse(user);
    }

    // ============== REFRESH TOKEN (giữ nguyên logic cũ) ==============
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String tokenType = jwtService.extractTokenType(token);
        if (!"refresh".equals(tokenType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token type");
        }

        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        if (!jwtService.isTokenValid(token, user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        String newAccess = jwtService.generateAccessToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccess)
                .refreshToken(newRefresh)
                .user(toDto(user))
                .build();
    }

    public record TokenPair(String accessToken, String refreshToken) {}

    public TokenPair generateTokensForUser(User user) {
        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        return new TokenPair(access, refresh);
    }

    private AuthResponse buildAuthResponse(User user) {
        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .user(toDto(user))
                .build();
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
