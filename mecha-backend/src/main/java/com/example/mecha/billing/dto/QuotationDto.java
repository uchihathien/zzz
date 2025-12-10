// billing/dto/QuotationDto.java
package com.example.mecha.billing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@Schema(description = "Thông tin báo giá")
public class QuotationDto {

    private Long id;
    private String quoteNumber;

    private Long orderId;
    private String orderCode;

    private Instant issueDate;
    private Instant validUntil;

    private BigDecimal totalAmount;
}
