// cart/dto/CartItemDto.java
package com.example.mecha.cart.dto;

import com.example.mecha.cart.CartItemType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Thông tin 1 dòng trong giỏ hàng")
public class CartItemDto {

    private Long id;
    private CartItemType itemType;

    @Schema(description = "ID sản phẩm (nếu là PRODUCT)")
    private Long productId;

    @Schema(description = "Tên sản phẩm (nếu là PRODUCT)")
    private String productName;

    @Schema(description = "ID dịch vụ (nếu là SERVICE)")
    private Long serviceId;

    @Schema(description = "Tên dịch vụ (nếu là SERVICE)")
    private String serviceName;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
