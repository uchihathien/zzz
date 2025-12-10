// billing/dto/SendPdfEmailRequest.java
package com.example.mecha.billing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu gửi PDF qua email")
public class SendPdfEmailRequest {

    @Schema(description = "Địa chỉ email người nhận", example = "customer@example.com")
    @NotBlank(message = "to không được để trống")
    @Email(message = "Email không hợp lệ")
    private String to;

    @Schema(description = "Tiêu đề email", example = "Báo giá đơn hàng ORD-xxxx")
    @Size(max = 255, message = "subject không được dài quá 255 ký tự")
    private String subject;

    @Schema(description = "Nội dung email (thuần text)")
    private String body;
}
