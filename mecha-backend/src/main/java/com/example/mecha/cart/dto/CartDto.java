// cart/dto/CartDto.java
package com.example.mecha.cart.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@Schema(description = "Giỏ hàng của user")
public class CartDto {

    private Long id;
    private List<CartItemDto> items;

    @Schema(description = "Tổng số dòng item", example = "3")
    private Integer totalItems;

    @Schema(description = "Tổng tiền giỏ hàng", example = "1500000")
    private BigDecimal totalAmount;
}
