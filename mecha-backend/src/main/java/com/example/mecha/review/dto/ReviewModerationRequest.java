// review/dto/ReviewModerationRequest.java
package com.example.mecha.review.dto;

import com.example.mecha.review.ReviewStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu duyệt đánh giá (admin/staff)")
public class ReviewModerationRequest {

    @Schema(description = "Trạng thái mới: APPROVED hoặc REJECTED", example = "APPROVED")
    @NotNull(message = "status không được null")
    private ReviewStatus status;

    @Schema(description = "Ghi chú nội bộ (tuỳ chọn)")
    private String adminNote;
}
