// order/dto/OrderItemDto.java
package com.example.mecha.order.dto;

import com.example.mecha.cart.CartItemType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Thông tin 1 dòng trong đơn hàng")
public class OrderItemDto {

    private Long id;
    private CartItemType itemType;
    private Long productId;
    private String productName;
    private Long serviceId;
    private String serviceName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
