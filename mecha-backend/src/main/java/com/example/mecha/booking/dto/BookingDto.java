// booking/dto/BookingDto.java
package com.example.mecha.booking.dto;

import com.example.mecha.booking.BookingStatus;
import com.example.mecha.order.PaymentMethod;
import com.example.mecha.order.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

@Data
@Builder
@Schema(description = "Thông tin chi tiết booking dịch vụ")
public class BookingDto {

    @Schema(example = "100")
    private Long id;

    @Schema(description = "ID dịch vụ", example = "1")
    private Long serviceId;

    @Schema(description = "Tên dịch vụ", example = "Vệ sinh máy lạnh")
    private String serviceName;

    @Schema(description = "ID khách hàng", example = "5")
    private Long customerId;

    @Schema(description = "Tên khách hàng", example = "Nguyễn Văn A")
    private String customerName;

    @Schema(description = "ID kỹ thuật viên (nếu có)", example = "10")
    private Long technicianId;

    @Schema(description = "Tên kỹ thuật viên (nếu có)", example = "Trần Văn B")
    private String technicianName;

    private OffsetDateTime scheduledAt;

    private String addressLine;

    private String contactPhone;

    private String note;

    private BookingStatus status;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    @Schema(description = "Giá dịch vụ tại thời điểm đặt", example = "300000")
    private BigDecimal priceAtBooking;

    private Instant createdAt;
}
