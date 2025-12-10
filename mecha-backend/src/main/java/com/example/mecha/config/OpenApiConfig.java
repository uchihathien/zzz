package com.example.mecha.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Mechanical Shop API",
                version = "1.0.0",
                description = "API cho hệ thống bán sản phẩm cơ khí + dịch vụ bảo trì/sửa chữa",
                contact = @Contact(name = "Dev Team", email = "dev@example.com"),
                license = @License(name = "Private")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Dev")
        }
)
public class OpenApiConfig {
    // Có thể bổ sung GroupedOpenApi nếu muốn tách group /admin, /auth ...
}
