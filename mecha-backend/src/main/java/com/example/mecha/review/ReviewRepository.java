// review/ReviewRepository.java
package com.example.mecha.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, ReviewStatus status);

    List<Review> findByServiceIdAndStatusOrderByCreatedAtDesc(Long serviceId, ReviewStatus status);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndServiceId(Long userId, Long serviceId);

    List<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status);

    @Query("""
           SELECT AVG(r.rating) FROM Review r
           WHERE r.product.id = :productId AND r.status = com.example.mecha.review.ReviewStatus.APPROVED
           """)
    Double averageRatingForProduct(@Param("productId") Long productId);

    @Query("""
           SELECT COUNT(r) FROM Review r
           WHERE r.product.id = :productId AND r.status = com.example.mecha.review.ReviewStatus.APPROVED
           """)
    Long countApprovedForProduct(@Param("productId") Long productId);

    @Query("""
           SELECT AVG(r.rating) FROM Review r
           WHERE r.service.id = :serviceId AND r.status = com.example.mecha.review.ReviewStatus.APPROVED
           """)
    Double averageRatingForService(@Param("serviceId") Long serviceId);

    @Query("""
           SELECT COUNT(r) FROM Review r
           WHERE r.service.id = :serviceId AND r.status = com.example.mecha.review.ReviewStatus.APPROVED
           """)
    Long countApprovedForService(@Param("serviceId") Long serviceId);
}
