// review/ReviewService.java
package com.example.mecha.review;

import com.example.mecha.booking.BookingRepository;
import com.example.mecha.order.OrderItemRepository;
import com.example.mecha.review.dto.*;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final BookingRepository bookingRepository;

    // ===== USER APIs =====

    @Transactional
    public ReviewDto createReview(ReviewCreateRequest request, User currentUser) {
        boolean isProduct = request.getProductId() != null;
        boolean isService = request.getServiceId() != null;

        if (isProduct == isService) {
            // cả 2 null hoặc cả 2 cùng có -> không hợp lệ
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EITHER_PRODUCT_OR_SERVICE_REQUIRED");
        }

        if (isProduct) {
            Long productId = request.getProductId();

            if (!orderItemRepository.existsCompletedOrderForProduct(currentUser.getId(), productId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "USER_HAS_NOT_PURCHASED_PRODUCT");
            }

            if (reviewRepository.existsByUserIdAndProductId(currentUser.getId(), productId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ALREADY_REVIEWED_PRODUCT");
            }

            Review review = Review.builder()
                    .user(currentUser)
                    .product(new com.example.mecha.product.Product() {{
                        setId(productId);
                    }})
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .status(ReviewStatus.PENDING)
                    .build();

            review = reviewRepository.save(review);
            return toDto(review);
        } else {
            Long serviceId = request.getServiceId();

            if (!bookingRepository.existsCompletedBookingForService(currentUser.getId(), serviceId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "USER_HAS_NOT_COMPLETED_SERVICE");
            }

            if (reviewRepository.existsByUserIdAndServiceId(currentUser.getId(), serviceId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ALREADY_REVIEWED_SERVICE");
            }

            Review review = Review.builder()
                    .user(currentUser)
                    .service(new com.example.mecha.servicecatalog.ServiceEntity() {{
                        setId(serviceId);
                    }})
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .status(ReviewStatus.PENDING)
                    .build();

            review = reviewRepository.save(review);
            return toDto(review);
        }
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listMyReviews(User currentUser) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listApprovedReviewsForProduct(Long productId) {
        return reviewRepository
                .findByProductIdAndStatusOrderByCreatedAtDesc(productId, ReviewStatus.APPROVED)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listApprovedReviewsForService(Long serviceId) {
        return reviewRepository
                .findByServiceIdAndStatusOrderByCreatedAtDesc(serviceId, ReviewStatus.APPROVED)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ReviewSummaryDto getProductSummary(Long productId) {
        Double avg = reviewRepository.averageRatingForProduct(productId);
        Long count = reviewRepository.countApprovedForProduct(productId);
        return ReviewSummaryDto.builder()
                .averageRating(avg)
                .totalReviews(count != null ? count : 0L)
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewSummaryDto getServiceSummary(Long serviceId) {
        Double avg = reviewRepository.averageRatingForService(serviceId);
        Long count = reviewRepository.countApprovedForService(serviceId);
        return ReviewSummaryDto.builder()
                .averageRating(avg)
                .totalReviews(count != null ? count : 0L)
                .build();
    }

    // ===== ADMIN / STAFF =====

    @Transactional(readOnly = true)
    public List<ReviewDto> adminList(ReviewStatus status) {
        List<Review> reviews;
        if (status != null) {
            reviews = reviewRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            reviews = reviewRepository.findAll()
                    .stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }
        return reviews.stream().map(this::toDto).toList();
    }

    @Transactional
    public ReviewDto adminModerate(Long id, ReviewModerationRequest request, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN && currentUser.getRole() != UserRole.STAFF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ONLY_ADMIN_OR_STAFF_CAN_MODERATE");
        }

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "REVIEW_NOT_FOUND"));

        if (request.getStatus() == ReviewStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CANNOT_SET_PENDING");
        }

        review.setStatus(request.getStatus());
        // adminNote có thể được lưu ở bảng khác / audit log; ở đây mình chỉ bỏ qua
        // (để không thêm cột ngoài scope, bạn có thể log qua Audit Log AOP sau)

        return toDto(review);
    }

    private ReviewDto toDto(Review r) {
        String productName = r.getProduct() != null ? r.getProduct().getName() : null;
        String serviceName = r.getService() != null ? r.getService().getName() : null;

        return ReviewDto.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName())
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .productName(productName)
                .serviceId(r.getService() != null ? r.getService().getId() : null)
                .serviceName(serviceName)
                .rating(r.getRating())
                .comment(r.getComment())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
