// cart/CartController.java
package com.example.mecha.cart;

import com.example.mecha.cart.dto.*;
import com.example.mecha.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
@Tag(name = "Cart", description = "Giỏ hàng hỗn hợp sản phẩm + dịch vụ")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xem giỏ hàng hiện tại của user")
    public ResponseEntity<CartDto> getMyCart(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(cartService.getMyCart(currentUser));
    }

    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Thêm item vào giỏ hàng")
    public ResponseEntity<CartDto> addItem(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CartItemAddRequest request
    ) {
        return ResponseEntity.ok(cartService.addItem(currentUser, request));
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật số lượng item trong giỏ")
    public ResponseEntity<CartDto> updateItem(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long itemId,
            @Valid @RequestBody CartItemUpdateRequest request
    ) {
        return ResponseEntity.ok(cartService.updateItem(currentUser, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa item khỏi giỏ")
    public ResponseEntity<CartDto> removeItem(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long itemId
    ) {
        return ResponseEntity.ok(cartService.removeItem(currentUser, itemId));
    }

    @DeleteMapping("/items")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa toàn bộ giỏ hàng")
    public ResponseEntity<CartDto> clearCart(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(cartService.clearCart(currentUser));
    }
}
