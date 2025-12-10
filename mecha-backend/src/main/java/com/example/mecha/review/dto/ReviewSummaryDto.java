// review/dto/ReviewSummaryDto.java
package com.example.mecha.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Tóm tắt đánh giá (điểm trung bình + số lượt)")
public class ReviewSummaryDto {

    @Schema(description = "Điểm trung bình (1-5). null nếu chưa có.")
    private Double averageRating;

    @Schema(description = "Tổng số đánh giá đã được duyệt")
    private Long totalReviews;
}
