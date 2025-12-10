// servicecatalog/dto/ServiceDto.java
package com.example.mecha.servicecatalog.dto;

import com.example.mecha.servicecatalog.ServiceStatus;
import com.example.mecha.servicecatalog.ServiceType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Thông tin dịch vụ")
public class ServiceDto {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Vệ sinh máy lạnh")
    private String name;

    @Schema(example = "CLEANING_AC")
    private String code;

    private String description;

    private ServiceType type;

    private BigDecimal basePrice;

    private Integer durationMinutes;

    private ServiceStatus status;
}
