// payment/sepay/SepayPaymentController.java
package com.example.mecha.payment.sepay;

import com.example.mecha.payment.sepay.dto.SepayPaymentInfoDto;
import com.example.mecha.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment/sepay")
@RequiredArgsConstructor
@Validated
@Tag(name = "SePay Payment", description = "Thanh toán chuyển khoản ngân hàng qua SePay")
@SecurityRequirement(name = "bearerAuth")
public class SepayPaymentController {

    private final SepayPaymentService sepayPaymentService;

    @GetMapping("/info/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Lấy thông tin thanh toán chuyển khoản cho 1 đơn hàng",
            description = "Trả về số tài khoản, tên ngân hàng, mã thanh toán (orderCode) và link QR VietQR (SePay)"
    )
    public ResponseEntity<SepayPaymentInfoDto> getPaymentInfo(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long orderId
    ) {
        return ResponseEntity.ok(sepayPaymentService.getPaymentInfo(orderId, currentUser));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Lấy thông tin thanh toán chuyển khoản cho 1 booking",
            description = "Trả về số tài khoản, tên ngân hàng, mã thanh toán và link QR VietQR (SePay)"
    )
    public ResponseEntity<SepayPaymentInfoDto> getBookingPaymentInfo(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long bookingId
    ) {
        return ResponseEntity.ok(sepayPaymentService.getBookingPaymentInfo(bookingId, currentUser));
    }
}

