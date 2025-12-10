// servicecatalog/dto/ServiceUpdateRequest.java
package com.example.mecha.servicecatalog.dto;

import com.example.mecha.servicecatalog.ServiceStatus;
import com.example.mecha.servicecatalog.ServiceType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Yêu cầu cập nhật dịch vụ")
public class ServiceUpdateRequest {

    @Schema(description = "Tên dịch vụ", example = "Vệ sinh máy lạnh (nâng cao)")
    @Size(max = 255, message = "Tên dịch vụ không được dài quá 255 ký tự")
    private String name;

    @Schema(description = "Mã dịch vụ", example = "CLEANING_AC_PREMIUM")
    @Size(max = 100, message = "Mã dịch vụ không được dài quá 100 ký tự")
    private String code;

    private String description;

    private ServiceType type;

    @DecimalMin(value = "0.0", inclusive = false, message = "basePrice phải > 0")
    private BigDecimal basePrice;

    @Min(value = 1, message = "durationMinutes phải >= 1 phút")
    private Integer durationMinutes;

    private ServiceStatus status;
}
