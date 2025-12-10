// order/OrderController.java
package com.example.mecha.order;

import com.example.mecha.order.dto.OrderCreateRequest;
import com.example.mecha.order.dto.OrderDto;
import com.example.mecha.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
@Tag(name = "Orders", description = "Đặt hàng & quản lý đơn hàng")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    // USER: checkout từ giỏ hàng
    @PostMapping("/orders/checkout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đặt hàng từ giỏ hàng hiện tại")
    public ResponseEntity<OrderDto> checkout(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody OrderCreateRequest request
    ) {
        return ResponseEntity.ok(orderService.checkout(currentUser, request));
    }

    // USER: danh sách đơn hàng của mình
    @GetMapping("/orders/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách đơn hàng của tôi")
    public ResponseEntity<List<OrderDto>> myOrders(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(orderService.listMyOrders(currentUser));
    }

    // Xem chi tiết đơn hàng (chỉ chủ đơn hoặc admin/staff)
    @GetMapping("/orders/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Chi tiết đơn hàng")
    public ResponseEntity<OrderDto> getOrder(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(orderService.getByIdForUser(id, currentUser));
    }

    // USER: hủy đơn hàng (chỉ khi còn PENDING)
    @PutMapping("/orders/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Hủy đơn hàng của mình (chỉ khi đơn còn PENDING)")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(orderService.cancelOrderByUser(id, currentUser));
    }


    // ADMIN / STAFF: search đơn hàng
    @GetMapping("/admin/orders")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Admin: tìm kiếm đơn hàng với filter")
    public ResponseEntity<List<OrderDto>> adminSearch(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return ResponseEntity.ok(orderService.adminSearch(status, paymentStatus, from, to));
    }

    // ADMIN / STAFF: cập nhật trạng thái đơn hàng
    @PatchMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Admin: cập nhật trạng thái đơn hàng")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable @Positive Long id,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // ADMIN / STAFF: cập nhật trạng thái thanh toán (đồng bộ với VNPay/Momo/bank manual)
    @PatchMapping("/admin/orders/{id}/payment-status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Admin: cập nhật trạng thái thanh toán")
    public ResponseEntity<OrderDto> updatePaymentStatus(
            @PathVariable @Positive Long id,
            @RequestParam PaymentStatus paymentStatus
    ) {
        return ResponseEntity.ok(orderService.updatePaymentStatus(id, paymentStatus));
    }
}
