// billing/dto/QuotationCreateRequest.java
package com.example.mecha.billing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(description = "Yêu cầu tạo báo giá từ đơn hàng")
public class QuotationCreateRequest {

    @Schema(
            description = "Hạn hiệu lực báo giá (ISO 8601) - optional",
            example = "2025-02-01T00:00:00Z"
    )
    @FutureOrPresent(message = "validUntil phải ở hiện tại hoặc tương lai")
    private Instant validUntil;
}
