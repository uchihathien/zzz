// billing/InvoiceController.java
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
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Validated
@Tag(name = "Invoices", description = "Hóa đơn dựa trên đơn hàng")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final BillingService billingService;

    // Tạo hóa đơn từ đơn hàng (ADMIN/STAFF)
    @PostMapping("/from-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Tạo hóa đơn từ đơn hàng")
    public ResponseEntity<InvoiceDto> createFromOrder(
            @PathVariable @Positive Long orderId,
            @Valid @RequestBody(required = false) InvoiceCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        InvoiceCreateRequest req = (request != null) ? request : new InvoiceCreateRequest();
        return ResponseEntity.ok(billingService.createInvoice(orderId, req, currentUser));
    }

    // Xem hóa đơn
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Chi tiết hóa đơn")
    public ResponseEntity<InvoiceDto> getInvoice(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(billingService.getInvoice(id, currentUser));
    }

    // Danh sách hóa đơn theo order
    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách hóa đơn của 1 đơn hàng")
    public ResponseEntity<List<InvoiceDto>> listByOrder(
            @PathVariable @Positive Long orderId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(billingService.listInvoicesByOrder(orderId, currentUser));
    }

    // Tải PDF hóa đơn
    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tải PDF hóa đơn (generate on-demand)")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        byte[] pdf = billingService.getInvoicePdf(id, currentUser);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"invoice-" + id + ".pdf\"")
                .body(pdf);
    }

    // Gửi PDF hóa đơn qua email
    @PostMapping("/{id}/send-email")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gửi hóa đơn PDF qua email")
    public ResponseEntity<Void> sendEmail(
            @PathVariable @Positive Long id,
            @Valid @RequestBody SendPdfEmailRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        billingService.sendInvoiceEmail(id, request, currentUser);
        return ResponseEntity.ok().build();
    }
}
