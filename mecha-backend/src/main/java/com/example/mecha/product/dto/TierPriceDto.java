package com.example.mecha.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Thông tin tier giá theo số lượng")
public class TierPriceDto {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "1")
    private Integer minQty;

    @Schema(example = "99")
    private Integer maxQty;

    @Schema(example = "4500")
    private BigDecimal unitPrice;
}
