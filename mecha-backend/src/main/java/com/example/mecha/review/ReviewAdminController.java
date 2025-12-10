// review/ReviewAdminController.java
package com.example.mecha.review;

import com.example.mecha.review.dto.ReviewDto;
import com.example.mecha.review.dto.ReviewModerationRequest;
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
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin - Reviews", description = "Quản lý & duyệt đánh giá (Admin/Staff)")
@SecurityRequirement(name = "bearerAuth")
public class ReviewAdminController {

    private final ReviewService reviewService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Danh sách đánh giá (lọc theo trạng thái)")
    public ResponseEntity<List<ReviewDto>> list(
            @RequestParam(required = false) ReviewStatus status
    ) {
        return ResponseEntity.ok(reviewService.adminList(status));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Duyệt đánh giá (APPROVED / REJECTED)")
    public ResponseEntity<ReviewDto> moderate(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ReviewModerationRequest request
    ) {
        return ResponseEntity.ok(reviewService.adminModerate(id, request, currentUser));
    }
}
