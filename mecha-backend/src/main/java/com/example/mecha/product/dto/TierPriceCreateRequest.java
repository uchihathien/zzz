package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Thông tin giá theo số lượng cho một tier")
public class TierPriceCreateRequest {

    @Schema(description = "Số lượng tối thiểu", example = "1")
    @NotNull(message = "minQty không được null")
    @Min(value = 1, message = "minQty phải >= 1")
    private Integer minQty;

    @Schema(description = "Số lượng tối đa (null = không giới hạn)", example = "99")
    @Min(value = 1, message = "maxQty (nếu có) phải >= 1")
    private Integer maxQty;

    @Schema(description = "Đơn giá áp dụng cho tier này", example = "4500")
    @NotNull(message = "unitPrice không được null")
    @DecimalMin(value = "0.0", inclusive = false, message = "unitPrice phải > 0")
    private BigDecimal unitPrice;
}
