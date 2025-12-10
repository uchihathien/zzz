package com.example.mecha.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration để enable async processing (gửi email không đồng bộ)
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
