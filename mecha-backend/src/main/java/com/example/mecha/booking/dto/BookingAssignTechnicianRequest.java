// booking/dto/BookingAssignTechnicianRequest.java
package com.example.mecha.booking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu gán kỹ thuật viên cho booking")
public class BookingAssignTechnicianRequest {

    @Schema(description = "ID kỹ thuật viên (user có role TECHNICIAN)", example = "10")
    @NotNull(message = "technicianId không được null")
    @Positive(message = "technicianId phải > 0")
    private Long technicianId;
}
