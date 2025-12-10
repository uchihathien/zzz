// booking/dto/BookingCreateRequest.java
package com.example.mecha.booking.dto;

import com.example.mecha.order.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Schema(description = "Yêu cầu đặt lịch dịch vụ")
public class BookingCreateRequest {

    @Schema(description = "ID dịch vụ", example = "1")
    @NotNull(message = "serviceId không được null")
    @Positive(message = "serviceId phải > 0")
    private Long serviceId;

    @Schema(
            description = "Thời điểm hẹn (ISO 8601)",
            example = "2025-01-15T09:00:00+07:00"
    )
    @NotNull(message = "scheduledAt không được null")
    @FutureOrPresent(message = "scheduledAt phải ở hiện tại hoặc tương lai")
    private OffsetDateTime scheduledAt;

    @Schema(description = "Địa chỉ thực hiện dịch vụ", example = "123 Đường ABC, Quận 1, TP.HCM")
    @NotBlank(message = "addressLine không được để trống")
    @Size(max = 500, message = "addressLine không được dài quá 500 ký tự")
    private String addressLine;

    @Schema(description = "Số điện thoại liên hệ", example = "0909123456")
    @NotBlank(message = "contactPhone không được để trống")
    @Size(max = 50, message = "contactPhone không được dài quá 50 ký tự")
    private String contactPhone;

    @Schema(description = "Ghi chú thêm", example = "Ưu tiên khung giờ buổi sáng.")
    private String note;

    @Schema(description = "Phương thức thanh toán", example = "COD")
    private PaymentMethod paymentMethod;
}

