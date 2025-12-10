// order/dto/OrderCreateRequest.java
package com.example.mecha.order.dto;

import com.example.mecha.order.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu đặt hàng từ giỏ hàng hiện tại")
public class OrderCreateRequest {

    @Schema(description = "Phương thức thanh toán", example = "COD")
    @NotNull(message = "paymentMethod không được null")
    private PaymentMethod paymentMethod;

    @Schema(
            description = "ID địa chỉ giao hàng (nếu muốn dùng địa chỉ đã lưu). Nếu truyền field này, shippingAddress/contactPhone có thể bỏ trống.",
            example = "5"
    )
    private Long shippingAddressId;

    @Schema(description = "Địa chỉ giao hàng / liên hệ", example = "123 Đường ABC, Quận 1, TP.HCM")
    @Size(max = 500, message = "shippingAddress không được dài quá 500 ký tự")
    private String shippingAddress;

    @Schema(description = "Số điện thoại liên hệ", example = "0909123456")
    @Size(max = 50, message = "contactPhone không được dài quá 50 ký tự")
    private String contactPhone;

    @Schema(description = "Ghi chú đơn hàng", example = "Giao giờ hành chính.")
    private String note;
}
