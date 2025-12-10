package com.example.mecha.config;

import com.example.mecha.config.JwtService;
import com.example.mecha.user.AuthProvider;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRepository;
import com.example.mecha.user.UserRole;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;   // 🔥 thay vì AuthService

    @Value("${app.oauth2.redirect-uri}")
    private String frontendRedirectUri; // ví dụ: http://localhost:3000/auth/oauth2/callback

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found from provider");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .fullName(name)
                    .role(UserRole.USER)
                    .provider(AuthProvider.GOOGLE)
                    .emailVerified(true)
                    .build();
            return userRepository.save(newUser);
        });

        if (user.getProvider() == null) {
            user.setProvider(AuthProvider.GOOGLE);
            userRepository.save(user);
        }

        // ✅ Generate access/refresh token trực tiếp ở đây
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendRedirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        response.sendRedirect(redirectUrl);
    }
}
