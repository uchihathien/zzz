// review/dto/ReviewDto.java
package com.example.mecha.review.dto;

import com.example.mecha.review.ReviewStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@Schema(description = "Thông tin đánh giá")
public class ReviewDto {

    private Long id;

    @Schema(description = "ID user đã đánh giá")
    private Long userId;

    @Schema(description = "Tên người đánh giá")
    private String userName;

    private Long productId;
    private String productName;

    private Long serviceId;
    private String serviceName;

    private Integer rating;
    private String comment;
    private ReviewStatus status;
    private Instant createdAt;
}
