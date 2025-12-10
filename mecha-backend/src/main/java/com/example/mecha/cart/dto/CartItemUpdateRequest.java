// cart/dto/CartItemUpdateRequest.java
package com.example.mecha.cart.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu cập nhật số lượng cart item")
public class CartItemUpdateRequest {

    @Schema(description = "Số lượng mới", example = "10")
    @NotNull(message = "quantity không được null")
    @Min(value = 1, message = "quantity phải >= 1")
    private Integer quantity;
}
