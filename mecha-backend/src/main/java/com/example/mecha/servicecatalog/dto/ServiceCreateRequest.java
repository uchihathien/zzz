// servicecatalog/dto/ServiceCreateRequest.java
package com.example.mecha.servicecatalog.dto;

import com.example.mecha.servicecatalog.ServiceStatus;
import com.example.mecha.servicecatalog.ServiceType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Yêu cầu tạo mới dịch vụ")
public class ServiceCreateRequest {

    @Schema(description = "Tên dịch vụ", example = "Vệ sinh máy lạnh")
    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 255, message = "Tên dịch vụ không được dài quá 255 ký tự")
    private String name;

    @Schema(description = "Mã dịch vụ duy nhất", example = "CLEANING_AC")
    @Size(max = 100, message = "Mã dịch vụ không được dài quá 100 ký tự")
    private String code;

    @Schema(description = "Mô tả chi tiết dịch vụ", example = "Vệ sinh, bảo dưỡng máy lạnh gia đình")
    private String description;

    @Schema(description = "Loại dịch vụ", example = "CLEANING")
    private ServiceType type;

    @Schema(description = "Đơn giá cơ bản", example = "300000")
    @NotNull(message = "basePrice không được null")
    @DecimalMin(value = "0.0", inclusive = false, message = "basePrice phải > 0")
    private BigDecimal basePrice;

    @Schema(description = "Thời lượng ước tính (phút)", example = "90")
    @Min(value = 1, message = "durationMinutes phải >= 1 phút")
    private Integer durationMinutes;

    @Schema(description = "Trạng thái dịch vụ", example = "ACTIVE")
    private ServiceStatus status;
}
