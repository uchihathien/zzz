package com.example.mecha.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@Schema(description = "Cấu trúc lỗi trả về từ API")
public class ApiError {

    @Schema(description = "Timestamp", example = "2025-01-01T10:00:00Z")
    private Instant timestamp;

    @Schema(description = "HTTP status code", example = "400")
    private int status;

    @Schema(description = "Mã lỗi ngắn gọn", example = "VALIDATION_ERROR")
    private String error;

    @Schema(description = "Thông điệp lỗi", example = "Request không hợp lệ")
    private String message;

    @Schema(description = "Chi tiết lỗi field-level (nếu có)")
    private Map<String, List<String>> fieldErrors;
}
