// config/DataInitializer.java
package com.example.mecha.config;

import com.example.mecha.user.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Initialize test accounts on startup
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists("admin@mecha.com", "Admin123", "Admin Mecha", UserRole.ADMIN);
        createUserIfNotExists("staff@mecha.com", "Staff123", "Staff Mecha", UserRole.STAFF);
        createUserIfNotExists("technician@mecha.com", "Tech123", "Kỹ thuật viên", UserRole.TECHNICIAN);
        
        log.info("=== Test accounts initialized ===");
        log.info("ADMIN: admin@mecha.com / Admin123");
        log.info("STAFF: staff@mecha.com / Staff123");
        log.info("TECHNICIAN: technician@mecha.com / Tech123");
    }

    private void createUserIfNotExists(String email, String password, String fullName, UserRole role) {
        Optional<User> existing = userRepository.findByEmail(email);
        
        if (existing.isEmpty()) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .fullName(fullName)
                    .role(role)
                    .status(AccountStatus.ACTIVE)
                    .emailVerified(true)
                    .provider(AuthProvider.LOCAL)
                    .build();
            
            userRepository.save(user);
            log.info("Created {} account: {}", role, email);
        } else {
            // Update role if different
            User user = existing.get();
            if (user.getRole() != role) {
                user.setRole(role);
                userRepository.save(user);
                log.info("Updated {} role to {}", email, role);
            }
        }
    }
}
