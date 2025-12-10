// order/dto/OrderDto.java
package com.example.mecha.order.dto;

import com.example.mecha.order.OrderStatus;
import com.example.mecha.order.PaymentMethod;
import com.example.mecha.order.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@Schema(description = "Thông tin đơn hàng")
public class OrderDto {

    private Long id;
    private String orderCode;

    private Long customerId;
    private String customerName;

    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus status;

    private String shippingAddress;
    private String contactPhone;
    private String note;

    private Instant createdAt;
    private List<OrderItemDto> items;
}
