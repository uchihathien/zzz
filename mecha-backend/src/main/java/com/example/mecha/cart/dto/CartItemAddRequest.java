// cart/dto/CartItemAddRequest.java
package com.example.mecha.cart.dto;

import com.example.mecha.cart.CartItemType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu thêm item vào giỏ hàng")
public class CartItemAddRequest {

    @Schema(description = "Loại item: PRODUCT hoặc SERVICE", example = "PRODUCT")
    @NotNull(message = "itemType không được null")
    private CartItemType itemType;

    @Schema(description = "ID sản phẩm (nếu itemType = PRODUCT)", example = "10")
    private Long productId;

    @Schema(description = "ID dịch vụ (nếu itemType = SERVICE)", example = "3")
    private Long serviceId;

    @Schema(description = "Số lượng", example = "5")
    @NotNull(message = "quantity không được null")
    @Min(value = 1, message = "quantity phải >= 1")
    private Integer quantity;
}
