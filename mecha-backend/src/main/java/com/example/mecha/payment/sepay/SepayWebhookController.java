// payment/sepay/SepayWebhookController.java
package com.example.mecha.payment.sepay;

import com.example.mecha.payment.sepay.dto.SepayWebhookRequest;
import com.example.mecha.payment.sepay.dto.SepayWebhookResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment/sepay/webhook")
@RequiredArgsConstructor
@Validated
@Tag(name = "SePay Webhook", description = "Endpoint nhận Webhook từ SePay")
public class SepayWebhookController {

    private final SepayPaymentService sepayPaymentService;

    @PostMapping
    @Operation(
            summary = "Webhook nhận giao dịch từ SePay",
            description = """
                    SePay sẽ POST JSON giao dịch vào endpoint này.
                    Header Authorization: Apikey {API_KEY}.
                    Yêu cầu trả về JSON {"success": true} với HTTP 200/201 để SePay hiểu là thành công.
                    """
    )
    public ResponseEntity<SepayWebhookResponse> handleWebhook(
            @Valid @RequestBody SepayWebhookRequest request,
            HttpServletRequest servletRequest
    ) {
        String authHeader = servletRequest.getHeader("Authorization");
        String result = sepayPaymentService.handleWebhook(request, authHeader);

        SepayWebhookResponse response = SepayWebhookResponse.builder()
                .success(true)
                .message(result)
                .build();

        // theo docs: 200 hoặc 201 đều được; chọn 200
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
