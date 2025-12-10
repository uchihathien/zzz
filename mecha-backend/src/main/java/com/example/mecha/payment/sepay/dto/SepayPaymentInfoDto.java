// payment/sepay/dto/SepayPaymentInfoDto.java
package com.example.mecha.payment.sepay.dto;

import com.example.mecha.order.PaymentMethod;
import com.example.mecha.order.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Thông tin thanh toán chuyển khoản qua SePay cho 1 đơn hàng")
public class SepayPaymentInfoDto {

    private Long orderId;
    private String orderCode;

    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    @Schema(description = "Tổng tiền cần thanh toán", example = "2277000")
    private BigDecimal amount;

    @Schema(description = "Số tài khoản nhận tiền", example = "0010000000355")
    private String bankAccountNumber;

    @Schema(description = "Tên ngân hàng", example = "Vietcombank")
    private String bankName;

    @Schema(description = "Tên chủ tài khoản", example = "CONG TY TNHH ABC")
    private String accountHolderName;

    @Schema(description = "Nội dung chuyển khoản gợi ý (mã thanh toán)", example = "ORD-1A2B3C4D")
    private String transferContent;

    @Schema(
            description = "Link ảnh QR VietQR (SePay) để FE nhúng <img>",
            example = "https://qr.sepay.vn/img?acc=0010000000355&bank=Vietcombank&amount=2277000&des=ORD-1A2B3C4D"
    )
    private String qrImageUrl;
}
