// billing/dto/InvoiceCreateRequest.java
package com.example.mecha.billing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu tạo hóa đơn từ đơn hàng")
public class InvoiceCreateRequest {
    // Hiện tại không cần field nào thêm; giữ đây để mở rộng sau nếu cần
}
