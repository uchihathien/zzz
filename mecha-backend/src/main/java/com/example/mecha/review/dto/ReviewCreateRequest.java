// review/dto/ReviewCreateRequest.java
package com.example.mecha.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu tạo đánh giá sản phẩm/dịch vụ")
public class ReviewCreateRequest {

    @Schema(
            description = "ID sản phẩm (nếu đánh giá sản phẩm). Chỉ được set 1 trong 2: productId hoặc serviceId.",
            example = "10"
    )
    private Long productId;

    @Schema(
            description = "ID dịch vụ (nếu đánh giá dịch vụ). Chỉ được set 1 trong 2: productId hoặc serviceId.",
            example = "3"
    )
    private Long serviceId;

    @Schema(description = "Điểm đánh giá (1-5)", example = "5")
    @NotNull(message = "rating không được null")
    @Min(value = 1, message = "rating phải >= 1")
    @Max(value = 5, message = "rating phải <= 5")
    private Integer rating;

    @Schema(description = "Nội dung đánh giá", example = "Sản phẩm tốt, giao hàng nhanh.")
    @Size(max = 2000, message = "comment không được dài quá 2000 ký tự")
    private String comment;
}
