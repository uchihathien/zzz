// shipping/ShippingAddressController.java
package com.example.mecha.shipping;

import com.example.mecha.shipping.dto.*;
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

import java.util.List;

@RestController
@RequestMapping("/api/shipping-addresses")
@RequiredArgsConstructor
@Validated
@Tag(name = "Shipping Addresses", description = "Địa chỉ giao hàng của khách hàng (tối đa 3)")
@SecurityRequirement(name = "bearerAuth")
public class ShippingAddressController {

    private final ShippingAddressService shippingAddressService;

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách địa chỉ giao hàng của tôi")
    public ResponseEntity<List<ShippingAddressDto>> myAddresses(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(shippingAddressService.listMyAddresses(currentUser));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo mới địa chỉ giao hàng (tối đa 3)")
    public ResponseEntity<ShippingAddressDto> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ShippingAddressCreateRequest request
    ) {
        return ResponseEntity.ok(shippingAddressService.createAddress(currentUser, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật địa chỉ giao hàng")
    public ResponseEntity<ShippingAddressDto> update(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long id,
            @Valid @RequestBody ShippingAddressUpdateRequest request
    ) {
        return ResponseEntity.ok(shippingAddressService.updateAddress(currentUser, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa địa chỉ giao hàng")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long id
    ) {
        shippingAddressService.deleteAddress(currentUser, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/set-default")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đặt địa chỉ mặc định")
    public ResponseEntity<ShippingAddressDto> setDefault(
            @AuthenticationPrincipal User currentUser,
            @PathVariable @Positive Long id
    ) {
        return ResponseEntity.ok(shippingAddressService.setDefault(currentUser, id));
    }
}
