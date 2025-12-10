// payment/sepay/dto/SepayWebhookResponse.java
package com.example.mecha.payment.sepay.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Response trả về cho SePay khi nhận webhook")
public class SepayWebhookResponse {

    @Schema(description = "SePay sẽ check success=true để xem webhook thành công")
    private boolean success;

    @Schema(description = "Thông tin thêm (optional)")
    private String message;
}
