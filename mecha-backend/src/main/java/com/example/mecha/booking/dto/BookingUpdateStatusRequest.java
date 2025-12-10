// booking/dto/BookingUpdateStatusRequest.java
package com.example.mecha.booking.dto;

import com.example.mecha.booking.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu thay đổi trạng thái booking")
public class BookingUpdateStatusRequest {

    @Schema(description = "Trạng thái mới", example = "CONFIRMED")
    @NotNull(message = "status không được null")
    private BookingStatus status;

    @Schema(description = "Ghi chú (lý do hủy, v.v.)")
    private String note;
}
