// payment/sepay/dto/SepayWebhookRequest.java
package com.example.mecha.payment.sepay.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Payload Webhook từ SePay gửi sang")
public class SepayWebhookRequest {

    @Schema(description = "ID giao dịch trên SePay", example = "92704")
    private Long id;

    @Schema(description = "Brand name ngân hàng", example = "Vietcombank")
    private String gateway;

    @Schema(description = "Thời gian giao dịch (string)", example = "2023-03-25 14:02:37")
    private String transactionDate;

    @Schema(description = "Số tài khoản ngân hàng", example = "0123499999")
    private String accountNumber;

    @Schema(description = "Mã code thanh toán (SePay nhận diện)", example = "ORD-1A2B3C4D")
    private String code;

    @Schema(description = "Nội dung chuyển khoản", example = "Thanh toan don hang ORD-1A2B3C4D")
    private String content;

    @Schema(description = "Loại giao dịch (in/out)", example = "in")
    private String transferType;

    @Schema(description = "Số tiền giao dịch", example = "2277000")
    private BigDecimal transferAmount;

    @Schema(description = "Số dư tài khoản sau giao dịch", example = "19077000")
    private BigDecimal accumulated;

    @Schema(description = "Tài khoản phụ (VA)", example = "0123499999-001")
    private String subAccount;

    @Schema(description = "Mã tham chiếu SMS", example = "MBVCB.3278907687")
    private String referenceCode;

    @Schema(description = "Toàn bộ nội dung SMS", example = "TK 0123 ... +2.277.000VND ...")
    private String description;
}
