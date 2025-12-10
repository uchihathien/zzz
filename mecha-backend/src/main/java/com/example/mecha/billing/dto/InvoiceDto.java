// billing/dto/InvoiceDto.java
package com.example.mecha.billing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@Schema(description = "Thông tin hóa đơn")
public class InvoiceDto {

    private Long id;
    private String invoiceNumber;

    private Long orderId;
    private String orderCode;

    private Instant issueDate;

    private BigDecimal totalAmount;
}
