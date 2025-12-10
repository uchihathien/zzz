// review/ReviewController.java
package com.example.mecha.review;

import com.example.mecha.review.dto.*;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Validated
@Tag(name = "Reviews", description = "Đánh giá & phản hồi sản phẩm / dịch vụ")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Tạo đánh giá mới",
            description = "Chỉ user đã mua sản phẩm hoặc đã hoàn thành dịch vụ mới được đánh giá"
    )
    public ResponseEntity<ReviewDto> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ReviewCreateRequest request
    ) {
        return ResponseEntity.ok(reviewService.createReview(request, currentUser));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách đánh giá của tôi")
    public ResponseEntity<List<ReviewDto>> myReviews(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(reviewService.listMyReviews(currentUser));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Danh sách đánh giá đã duyệt của 1 sản phẩm")
    public ResponseEntity<List<ReviewDto>> productReviews(
            @PathVariable @Positive Long productId
    ) {
        return ResponseEntity.ok(reviewService.listApprovedReviewsForProduct(productId));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Danh sách đánh giá đã duyệt của 1 dịch vụ")
    public ResponseEntity<List<ReviewDto>> serviceReviews(
            @PathVariable @Positive Long serviceId
    ) {
        return ResponseEntity.ok(reviewService.listApprovedReviewsForService(serviceId));
    }

    @GetMapping("/product/{productId}/summary")
    @Operation(summary = "Tóm tắt đánh giá sản phẩm (điểm trung bình + số lượt)")
    public ResponseEntity<ReviewSummaryDto> productSummary(
            @PathVariable @Positive Long productId
    ) {
        return ResponseEntity.ok(reviewService.getProductSummary(productId));
    }

    @GetMapping("/service/{serviceId}/summary")
    @Operation(summary = "Tóm tắt đánh giá dịch vụ (điểm trung bình + số lượt)")
    public ResponseEntity<ReviewSummaryDto> serviceSummary(
            @PathVariable @Positive Long serviceId
    ) {
        return ResponseEntity.ok(reviewService.getServiceSummary(serviceId));
    }
}
