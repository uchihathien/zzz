// billing/QuotationController.java
package com.example.mecha.billing;

import com.example.mecha.billing.dto.*;
import com.example.mecha.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
@Validated
@Tag(name = "Quotations", description = "Báo giá dựa trên đơn hàng")
@SecurityRequirement(name = "bearerAuth")
public class QuotationController {

    private final BillingService billingService;

    // Tạo báo giá từ đơn hàng (ADMIN/STAFF)
    @PostMapping("/from-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Tạo báo giá từ đơn hàng")
    public ResponseEntity<QuotationDto> createFromOrder(
            @PathVariable @Positive Long orderId,
            @Valid @RequestBody(required = false) QuotationCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        QuotationCreateRequest req = (request != null) ? request : new QuotationCreateRequest();
        return ResponseEntity.ok(billingService.createQuotation(orderId, req, currentUser));
    }

    // Xem báo giá
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Chi tiết báo giá")
    public ResponseEntity<QuotationDto> getQuotation(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(billingService.getQuotation(id, currentUser));
    }

    // Danh sách báo giá theo order
    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách báo giá của 1 đơn hàng")
    public ResponseEntity<List<QuotationDto>> listByOrder(
            @PathVariable @Positive Long orderId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(billingService.listQuotationsByOrder(orderId, currentUser));
    }

    // Tải PDF báo giá
    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tải PDF báo giá (generate on-demand)")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        byte[] pdf = billingService.getQuotationPdf(id, currentUser);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"quotation-" + id + ".pdf\"")
                .body(pdf);
    }

    // Gửi PDF báo giá qua email
    @PostMapping("/{id}/send-email")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gửi báo giá PDF qua email")
    public ResponseEntity<Void> sendEmail(
            @PathVariable @Positive Long id,
            @Valid @RequestBody SendPdfEmailRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        billingService.sendQuotationEmail(id, request, currentUser);
        return ResponseEntity.ok().build();
    }
}
